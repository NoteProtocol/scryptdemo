import { assert, ByteString, method, prop, SmartContract } from 'scrypt-ts'

export class N20_Simple extends SmartContract {
    @prop()
    readonly tick: ByteString

    @prop()
    readonly max: bigint

    @prop()
    readonly lim: bigint

    @prop()
    readonly dec: bigint

    constructor(tick: ByteString, max: bigint, lim: bigint, dec: bigint) {
        super(...arguments)
        this.tick = tick
        this.max = max
        this.lim = lim
        this.dec = dec
    }

    @method()
    public mint(tick: ByteString, amt: bigint, total: bigint) {
        assert(this.max == 0n || total <= this.max, 'Over max')
        assert(tick == this.tick, 'Tick does not match')
        assert(amt <= this.lim, 'Amount check failed')
    }

    @method()
    public transfer(tick: ByteString) {
        assert(tick == this.tick, 'Tick does not match')
    }
}
