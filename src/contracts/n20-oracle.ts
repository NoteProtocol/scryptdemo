import type { RabinPubKey, RabinSig } from 'scrypt-ts-lib'
import { ByteString, method, assert, prop, SmartContract } from 'scrypt-ts'
import { num2bin } from 'scryptlib'
import { Rabin_L1 } from './rabin'

export class N20_Oracle extends SmartContract {
  static readonly OUTPUT_NUM = 1

  // Oracles Rabin public key.
  @prop()
  oraclePubKey: RabinPubKey

  @prop()
  readonly tick: ByteString

  @prop()
  readonly max: bigint

  @prop()
  readonly lim: bigint

  @prop()
  readonly dec: bigint

  @prop()
  readonly lockHeight: bigint

  constructor(oraclePubKey: RabinPubKey, tick: ByteString, max: bigint, lim: bigint, dec: bigint, lockHeight: bigint) {
    super(...arguments)
    this.oraclePubKey = oraclePubKey
    this.tick = tick
    this.max = max
    this.lim = lim
    this.dec = dec
    this.lockHeight = lockHeight
  }

  @method()
  public mint(tick: ByteString, amt: bigint, total: bigint, oracleSig: RabinSig) {
    // , outputs: FixedArray<Output, typeof N20_Oracle.OUTPUT_NUM>
    // const account = sha256(reverseByteString(sha256(outputs[0].script), 32n))
    // Oracle msg = account (script hash) + tick + amount
    const msg = tick + num2bin(amt, 16)
    // Verify oracle signature.
    assert(Rabin_L1.verifySig(msg, oracleSig, this.oraclePubKey), 'Oracle sig verify failed.')

    assert(total <= this.max, 'Over max')
    assert(tick == this.tick, 'Tick does not match')
    assert(amt <= this.lim, 'Amount check failed')
  }

  @method()
  public transfer(height: bigint) {
    assert(height >= this.lockHeight, 'Height must be valid')
  }
}
