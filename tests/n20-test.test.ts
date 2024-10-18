/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { hash256, toByteString } from 'scrypt-ts'
import { N20_Test } from '../src/contracts/n20-test'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { stringToBytes } from 'scryptlib'
import { offlineVerify } from 'scrypt-verify'
import testJson from '../artifacts/n20-test.json'
import { Input, Output } from '../src/contracts/n20'

const bitwork = 'n20'
const tick = 'TEST#1'

const deployData = {
  p: 'n20',
  op: 'deploy',
  tick,
  max: 2100n * 10000n * 10n ** 8n,
  lim: 5000n * 10n ** 8n,
  dec: 8,
  sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
  start: 39495, //start height
  bitwork: stringToBytes(bitwork), //tx must start with bitwork
}

const mintData = {
  p: 'n20',
  op: 'mint',
  tick,
  amt: 5000n * 10n ** 8n,
  nonce: 0n,
}

const inputData: Input = {
  prevTxId: 'c3d007b2ad1789c885d6cc5b9c02bbe6a00ff56bca5af70f25cb7209ddf0413c',
  outputIndex: 0n,
  sequenceNumber: 0xffffffffn,
}
const outputData: Output = {
  script: '5120fb1397257ecba1b51739192853c08209235bb662482eaebf6556170442d7f050',
  satoshis: 546n,
}

describe('Test SmartContract `N20_Test`', () => {
  let instance: N20_Test
  const dataMap = {
    constructor: {
      p: stringToBytes(deployData.p),
      op: stringToBytes(deployData.op),
      tick: stringToBytes(deployData.tick),
      max: deployData.max,
      lim: deployData.lim,
      dec: deployData.dec,
      sch: deployData.sch,
      start: deployData.start,
      bitwork: deployData.bitwork,
    },
    mint: {
      p: stringToBytes(mintData.p),
      op: stringToBytes(mintData.op),
      tick: stringToBytes(mintData.tick),
      max: deployData.max,
      lim: deployData.lim,
      dec: deployData.dec,
      sch: deployData.sch,
      start: deployData.start,
      bitwork: deployData.bitwork,
      amt: mintData.amt,
      height: 39595,
      total: 0n,
      inputs: [inputData, inputData, inputData, inputData, inputData, inputData, inputData],
      outputs: [outputData, outputData, outputData],
      nonce: 100, //7224857n,
    },
    transfer: { tick: stringToBytes(deployData.tick), amt: [1000, 100] },
  }

  before(async () => {})

  it('offline mint verify successfully.', async () => {
    console.log('🚀 ~ it ~ dataMap:', dataMap)
    const result = offlineVerify(testJson, dataMap, 'mint')
    console.log('🚀 ~ it ~ result:', result)
    expect(result.success).is.true
  })
  it('offline transfer verify successfully.', async () => {
    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [1000, 100, 0] }
    let result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [1000, 100] }
    result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [1000, 100, 0, 1000] }
    result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [100] }
    result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.false

    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [100, 100] }
    result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.false

    dataMap.transfer = { tick: stringToBytes(deployData.tick), amt: [100, 100, 0, 100] }
    result = offlineVerify(testJson, dataMap, 'transfer')
    expect(result.success).is.false
  })
})
