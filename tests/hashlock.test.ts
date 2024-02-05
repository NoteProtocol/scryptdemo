import { expect, use } from 'chai'
import { sha256, toByteString, bsv, MethodCallOptions, PubKey, findSig } from 'scrypt-ts'
import { HashLock } from '../src/contracts/hashlock'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `Scryptdemo`', () => {
    let instance: HashLock
    let pubkey

    before(async () => {
        await HashLock.loadArtifact()

        const privkey = new bsv.PrivateKey(undefined, 'testnet')
        pubkey = privkey.toPublicKey()

        instance = new HashLock(PubKey(pubkey.toByteString()), sha256(toByteString('hello world', true)))
        await instance.connect(getDefaultSigner(privkey))
    })

    it('should pass the public method unit test successfully.', async () => {
        const deployTx = await instance.deploy(1)

        const call = async () => {
            const callRes = await instance.methods.unlock(
                (sigResps) => findSig(sigResps, pubkey),
                toByteString('hello world', true),
                toByteString('a', true),
                toByteString('b', true),
                toByteString('c', true),
                toByteString('d', true),
                toByteString('ff', true),
                {
                    pubKeyOrAddrToSign: pubkey,
                } as MethodCallOptions<HashLock>
            )
        }
        await expect(call()).not.to.be.rejected
    })

    it('should throw with wrong message.', async () => {
        await instance.deploy(1)

        const call = async () =>
            instance.methods.unlock(
                (sigResps) => findSig(sigResps, pubkey),
                toByteString('wrong world', true),
                toByteString('a', true),
                toByteString('b', true),
                toByteString('c', true),
                toByteString('d', true),
                toByteString('ff', true),
                // method call options
                {
                    // tell the signer to use the private key corresponding to `myPublicKey` to sign this transaction
                    // that is using `myPrivateKey` to sign the transaction
                    pubKeyOrAddrToSign: pubkey,
                } as MethodCallOptions<HashLock>
            )
        await expect(call()).to.be.rejectedWith(/Hash does not match/)
    })
})
