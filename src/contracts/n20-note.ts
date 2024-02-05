import { assert, ByteString, method, prop, SmartContract, hash256, slice, rshift, toByteString, len } from 'scrypt-ts'

export class N20_Note extends SmartContract {
    @prop()
    static tick: ByteString = toByteString('NOTE', true)

    @prop()
    static max: bigint = 2100000000000000n

    @prop()
    static lim: bigint = 500000000000n

    @prop()
    static dec: bigint = 8n

    @prop()
    static bitwork: ByteString = toByteString('e=', true)

    @prop()
    static start: bigint = 2576000n

    @method()
    getBlockLimit(height: bigint): bigint {
        assert(height >= N20_Note.start, 'Block height is too low')
        const halvings = (height - N20_Note.start) / 1000n
        let subsidy = 0n
        // Force block reward to zero when right shift is undefined.
        if (halvings < 39) {
            // Subsidy is cut in half every 1000 blocks which will occur approximately every 1 week.
            subsidy = rshift(N20_Note.lim, halvings)
        }

        return subsidy
    }

    @method()
    public mint(tick: ByteString, amt: bigint, total: bigint, height: bigint, tx: ByteString) {
        const txid = hash256(tx)
        assert(slice(txid, 0n, len(N20_Note.bitwork)) == N20_Note.bitwork, 'not match target')
        assert(N20_Note.max == 0n || total <= N20_Note.max, 'Over max')
        assert(tick == N20_Note.tick, 'Tick does not match')
        const limit = this.getBlockLimit(height)
        assert(amt <= limit && amt <= N20_Note.max - total, 'Amount check failed')
    }

    @method()
    public transfer(tick: ByteString) {
        assert(tick == N20_Note.tick, 'Tick does not match')
    }
}
