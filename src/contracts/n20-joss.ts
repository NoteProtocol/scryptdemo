import { assert, ByteString, method, prop, SmartContract, hash256, slice, rshift, toByteString, len } from 'scrypt-ts'

export class N20_Joss extends SmartContract {
    @prop()
    static tick: ByteString = toByteString('JOSS', true)

    @prop()
    static max: bigint = 0n

    @prop()
    static lim: bigint = 10000n

    @prop()
    static dec: bigint = 0n

    @method()
    public mint(tick: ByteString, amt: bigint) {
        assert(tick == N20_Joss.tick, 'Tick does not match')
        assert(amt == N20_Joss.lim, 'Limit does not match')
    }

    @method()
    public transfer() {
        assert(false)
    }

    @method()
    public burn(tick: ByteString) {
        assert(tick == N20_Joss.tick, 'Tick does not match')
    }
}
