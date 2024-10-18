import { assert, ByteString, FixedArray, method, prop, reverseByteString, sha256, SmartContract, toByteString } from 'scrypt-ts'
import { Output } from './n20'

export class N20_Tugou extends SmartContract {
  static readonly INPUT_NUM = 1
  static readonly OUTPUT_NUM = 2

  @prop()
  readonly tick: ByteString

  @prop()
  readonly max: bigint

  @prop()
  readonly lim: bigint

  @prop()
  readonly dec: bigint

  @prop()
  readonly owner: ByteString

  constructor(tick: ByteString, max: bigint, lim: bigint, dec: bigint, owner: ByteString) {
    super(...arguments)
    this.tick = tick
    this.max = max
    this.lim = lim
    this.dec = dec
    this.owner = owner
  }

  @method()
  public mint(tick: ByteString, amt: bigint, total: bigint) {
    assert(total <= this.max, 'Over max')
    assert(tick == this.tick, 'Tick does not match')
    assert(amt <= this.lim, 'Amount check failed')
  }

  @method()
  public transfer(tick: ByteString, amt: FixedArray<bigint, 3>, outputs: FixedArray<Output, typeof N20_Tugou.OUTPUT_NUM>) {
    assert(reverseByteString(sha256(outputs[1].script), 32n) == this.owner)
    const rate = 10n
    assert((amt[0] * rate) / 100n <= amt[1])
    assert(tick == this.tick, 'Tick does not match')
  }
}
