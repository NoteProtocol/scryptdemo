import { assert, ByteString, method, prop, SmartContract, hash256, slice, rshift, len } from 'scrypt-ts'

export class N20_Pow extends SmartContract {
    @prop()
    readonly tick: ByteString

    @prop()
    readonly max: bigint

    @prop()
    readonly lim: bigint

    @prop()
    readonly dec: bigint

    @prop()
    readonly bitwork: ByteString

    @prop()
    readonly start: bigint

    constructor(tick: ByteString, max: bigint, lim: bigint, dec: bigint, bitwork: ByteString, start: bigint) {
        super(...arguments)
        this.tick = tick
        this.max = max
        this.lim = lim
        this.dec = dec
        this.bitwork = bitwork
        this.start = start
    }

    @method()
    getBlockLimit(height: bigint): bigint {
        assert(height >= this.start, 'Block height is too low')
        let halvings = (height - this.start) / 1000n
        // Iterate up to 7 times to prevent the mining amount from becoming too small
        halvings = halvings > 7n ? 7n : halvings
        // Subsidy is cut in half every 1000 blocks which will occur approximately every 1 week.
        const subsidy = rshift(this.lim, halvings)

        return subsidy
    }

    @method()
    getAmountLimit(currentMined: bigint): bigint {
        let miningAmount = this.lim // Initial mining amount per operation

        // Set the initial halving threshold
        let threshold = this.max / 2n

        // Iterate up to 7 times to prevent the mining amount from becoming too small
        for (let halving = 0n; halving < 7n; halving++) {
            if (currentMined >= threshold) {
                miningAmount /= 2n // Halve the mining amount
                threshold += rshift(this.max, halving + 2n) // Update the next threshold
            }
        }

        return miningAmount
    }

    @method()
    public mint(tick: ByteString, amt: bigint, total: bigint, height: bigint, tx: ByteString) {
        const txid = hash256(tx)
        assert(slice(txid, 0n, len(this.bitwork)) == this.bitwork, 'not match target')
        assert(this.max == 0n || total <= this.max, 'Over max')
        assert(tick == this.tick, 'Tick does not match')
        const limit1 = this.getBlockLimit(height)
        const limit2 = this.getAmountLimit(total)
        const limit = limit1 > limit2 ? limit2 : limit1
        assert(amt <= limit && amt <= this.max - total, 'Amount check failed')
    }

    @method()
    public transfer(tick: ByteString) {
        assert(tick == this.tick, 'Tick does not match')
    }
}
