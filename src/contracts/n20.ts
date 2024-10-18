import { ByteString } from 'scrypt-ts'

export type Input = {
  prevTxId: ByteString
  outputIndex: bigint
  sequenceNumber: bigint
}

export type Output = {
  script: ByteString
  satoshis: bigint
}
