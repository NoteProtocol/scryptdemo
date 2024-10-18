import { assert, ByteString, FixedArray, method, prop, SmartContract, toByteString } from 'scrypt-ts'
import { Input, Output } from './n20'

export class N20_Test extends SmartContract {
  static readonly INPUT_NUM = 1
  static readonly OUTPUT_NUM = 1

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
  public mint(
    tick: ByteString,
    amt: bigint,
    total: bigint,
    inputs: FixedArray<Input, typeof N20_Test.INPUT_NUM>,
    outputs: FixedArray<Output, typeof N20_Test.OUTPUT_NUM>
  ) {
    assert(inputs[0].prevTxId != toByteString(''))
    assert(outputs[0].satoshis == 546n)

    assert(this.max == 0n || total <= this.max, 'Over max')
    assert(tick == this.tick, 'Tick does not match')
    assert(amt <= this.lim, 'Amount check failed')
  }

  @method()
  public transfer(tick: ByteString, amt: FixedArray<bigint, 3>) {
    assert(amt[0] == 1000n)
    assert(amt[1] == 100n)
    assert(amt[2] == 0n)
    assert(tick == this.tick, 'Tick does not match')
  }
}
