import { assert, method, prop, SmartContract } from 'scrypt-ts'

export class N20_CLTV_50720 extends SmartContract {
  @prop()
  static readonly lockHeight: bigint = 50720n

  @method()
  public transfer(height: bigint) {
    assert(height >= N20_CLTV_50720.lockHeight, 'Height must be valid')
  }
}
