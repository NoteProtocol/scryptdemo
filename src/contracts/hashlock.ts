import { assert, PubKey, Sig, ByteString, method, prop, sha256, Sha256, SmartContract, toByteString } from 'scrypt-ts'

export class HashLock extends SmartContract {
    @prop()
    static note: ByteString = toByteString('NOTE', true)

    @prop()
    pubKey: PubKey

    @prop()
    hash: ByteString

    constructor(pubKey: PubKey, hash: Sha256) {
        super(...arguments)
        this.pubKey = pubKey
        this.hash = hash
    }

    @method()
    public unlock(sig: Sig, message: ByteString, data0: ByteString, data1: ByteString, data2: ByteString, data3: ByteString, data4: ByteString) {
        HashLock.note
        assert(sha256(message) == this.hash, 'Hash does not match')
        assert(this.checkSig(sig, this.pubKey), 'signature check failed')
    }
}
