import { RabinPubKey, RabinSig } from 'scrypt-ts-lib'
import { ByteString, method, sha256, Utils, slice, SmartContractLib } from 'scrypt-ts'

export class Rabin_L1 extends SmartContractLib {
  static readonly OUTPUT_NUM = 1

  @method()
  static expandHash(x: ByteString): ByteString {
    // expand into 512 bit hash
    const hx = sha256(x)
    return sha256(slice(hx, 0n, 16n)) + sha256(slice(hx, 16n))
  }

  @method()
  static verifySig(msg: ByteString, sig: RabinSig, pubKey: RabinPubKey): boolean {
    const h = Utils.fromLEUnsigned(Rabin_L1.expandHash(msg + sig.padding))
    return (sig.s * sig.s) % pubKey == h % pubKey
  }
}
