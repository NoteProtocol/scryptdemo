import { assert, method, prop, SmartContract } from 'scrypt-ts'

export class N20_CLTV extends SmartContract {
  @prop()
  readonly lockHeight: bigint

  constructor(lockHeight: bigint) {
    super(...arguments)
    this.lockHeight = lockHeight
  }

  @method()
  public transfer(height: bigint) {
    assert(height >= this.lockHeight, 'Height must be valid')
  }
}
