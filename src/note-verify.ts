import { byteString2Int } from 'scrypt-ts'
import { int2ByteString } from 'scrypt-ts'
import { reverseByteString, Sha256, toByteString } from 'scrypt-ts'
import { MerklePath, type MerkleProof, type Node } from 'scrypt-ts-lib'
import { buildContractClass, type TxContext, type SupportedParamType, type Artifact, getValidatedHexString } from 'scryptlib'

export function buildOfflineContractInstance(abiJson: Artifact, dataMap: object) {
    const constructor: string = 'constructor'
    const paramsMap: { [key: string]: SupportedParamType[] } = {
        constructor: [],
    }

    const N20 = buildContractClass(abiJson)
    for (const abi of N20.abi) {
        let params: SupportedParamType[] = []
        let data

        if (abi.type === 'constructor') {
            params = paramsMap[constructor] = paramsMap[constructor] ?? []
            data = dataMap[constructor]
        } else if (abi.type === 'function') {
            params = paramsMap[abi.name!] = paramsMap[abi.name!] ?? []
            data = dataMap[abi.name!]
        }
        if (data) {
            for (const param of abi.params) {
                if (data[param.name] !== undefined) {
                    if (param.type === 'int') {
                        if (typeof data[param.name] === 'number' || typeof data[param.name] === 'bigint') {
                            params.push(BigInt(data[param.name]))
                        } else {
                            params.push(byteString2Int(data[param.name].toString('hex')))
                        }
                    } else if (param.type === 'bytes') {
                        params.push(getValidatedHexString(data[param.name]))
                    } else {
                        params.push(data[param.name])
                    }
                } else {
                    throw new Error(`${param.name} is not exist`)
                }
            }
        }
    }

    const instance = new N20(...paramsMap[constructor]!)
    return { N20, instance, paramsMap }
}

export function offlineVerify(abiJson: Artifact, dataMap: object, method: string, txContext?: TxContext) {
    const { N20, instance, paramsMap } = buildOfflineContractInstance(abiJson, dataMap)
    if (!paramsMap[method]) {
        throw new Error(`method function is not exist in data`)
    }
    const unlocking = N20.abiCoder.encodePubFunctionCall(instance, method, paramsMap[method]!)
    const result = instance.run_verify(unlocking.unlockingScript, txContext)
    return result
}

export function prepProofFromElectrum(proof: any): MerkleProof {
    const res: Array<Node> = []
    const directions = numToBoolList(proof.pos)

    proof.merkle.forEach((hash, i) => {
        let pos = MerklePath.RIGHT_NODE
        if (i < directions.length && directions[i] == true) {
            pos = MerklePath.LEFT_NODE
        }

        res.push({
            hash: Sha256(reverseByteString(toByteString(hash), 32n)),
            pos,
        } as Node)
    })

    // Pad remainder with invalid nodes.
    const invalidNode = {
        hash: Sha256('0000000000000000000000000000000000000000000000000000000000000000'),
        pos: MerklePath.INVALID_NODE,
    }
    return [...res, ...Array(Number(MerklePath.DEPTH) - res.length).fill(invalidNode)] as MerkleProof
}

export function numToBoolList(num) {
    const binaryStr = num.toString(2)
    const boolArray: boolean[] = []

    for (let i = binaryStr.length - 1; i >= 0; i--) {
        boolArray.push(binaryStr[i] === '1')
    }

    return boolArray
}
/**
 * inspired by : https://bigishdata.com/2017/11/13/how-to-build-a-blockchain-part-4-1-bitcoin-proof-of-work-difficulty-explained/
 * @param {*} bitsHex bits of block header, in big endian
 * @returns a target number
 */
export function toTarget(bitsHex) {
    const shift = bitsHex.substr(0, 2)
    const exponent = parseInt(shift, 16)
    const value = bitsHex.substr(2, bitsHex.length)
    const coefficient = parseInt(value, 16)
    const target = coefficient * 2 ** (8 * (exponent - 3))
    return BigInt(target)
}

export function bigint2buffer(n: bigint) {
    return Buffer.from(int2ByteString(n), 'hex')
}
