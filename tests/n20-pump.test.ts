/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { hash256, toByteString } from 'scrypt-ts'
import { N20_Pump } from '../src/contracts/n20-pump'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { stringToBytes } from 'scryptlib'
import { offlineVerify } from 'scrypt-verify'
import pumpJson from '../artifacts/n20-pump.json'

const bitwork = 'n20'
const tick = 'PUMP#1'

const deployData = {
    p: 'n20',
    op: 'deploy',
    tick,
    max: 2100n * 10000n * 10n ** 8n,
    lim: 5000n * 10n ** 8n,
    dec: 8,
    sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
    start: 39495, //start height
    bitwork: stringToBytes(bitwork), //tx must start with bitwork
}

const mintData = {
    p: 'n20',
    op: 'mint',
    tick,
    amt: 5000n * 10n ** 8n,
    nonce: 0n,
}

const inputData = {
    prevTxId: 'c3d007b2ad1789c885d6cc5b9c02bbe6a00ff56bca5af70f25cb7209ddf0413c',
    outputIndex: 0n,
    sequenceNumber: 0xffffffffn,
}

describe('Test SmartContract `N20_Pump`', () => {
    let instance: N20_Pump

    before(async () => {})

    it('offline verify successfully.', async () => {
        const dataMap = {
            constructor: {
                p: stringToBytes(deployData.p),
                op: stringToBytes(deployData.op),
                tick: stringToBytes(deployData.tick),
                max: deployData.max,
                lim: deployData.lim,
                dec: deployData.dec,
                sch: deployData.sch,
                start: deployData.start,
                bitwork: deployData.bitwork,
            },
            mint: {
                p: stringToBytes(mintData.p),
                op: stringToBytes(mintData.op),
                tick: stringToBytes(mintData.tick),
                max: deployData.max,
                lim: deployData.lim,
                dec: deployData.dec,
                sch: deployData.sch,
                start: deployData.start,
                bitwork: deployData.bitwork,
                amt: mintData.amt,
                height: 39595,
                total: 0n,
                inputs: [inputData, inputData, inputData, inputData, inputData, inputData, inputData],
                nonce: 100, //7224857n,
            },
            transfer: { tick: stringToBytes(deployData.tick) },
        }
        console.log('🚀 ~ it ~ dataMap:', dataMap)
        const result = offlineVerify(pumpJson, dataMap, 'mint')
        console.log('🚀 ~ it ~ result:', result)
        expect(result.success).is.true
    })
    it('should pass the public method unit test successfully.', async () => {
        await N20_Pump.loadArtifact()

        instance = new N20_Pump(toByteString(tick, true), deployData.max, deployData.lim, BigInt(deployData.dec), deployData.bitwork, BigInt(deployData.start))

        await instance.connect(getDefaultSigner())

        const deployTx = await instance.deploy(1000)

        const call = async () => {
            {
                const callRes = await instance.methods.mint(toByteString(tick, true), mintData.amt, 0, 39695n, 7224857n, [inputData])
            }
        }
        await expect(call()).not.to.be.rejected
    })
})
