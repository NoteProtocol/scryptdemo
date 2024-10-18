/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { hash256, reverseByteString, toByteString } from 'scrypt-ts'
import { N20_Tugou } from '../src/contracts/n20-tugou'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { sha256, stringToBytes } from 'scryptlib'
import { buildOfflineContractInstance, offlineVerify } from 'scrypt-verify'
import tugouJson from '../artifacts/n20-tugou.json'
import { Input, Output } from '../src/contracts/n20'

const bitwork = 'n20'
const tick = 'TUGOU#1'
//Owner's account(scriptHash of Script)
const owner = '209e7f0e21d5314ff6d0370200565f1831a84b8c6666331dca00d8d16dbdcc24'

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

describe('Test SmartContract `N20_Tugou`', () => {
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
      owner: owner,
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
    transfer: { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [1000, 100] },
  }

  before(async () => {})

  it('construct successfully.', async () => {
    expect(reverseByteString(sha256(outputData.script), 32n)).is.eq(owner)
    console.log('🚀 ~ it ~ dataMap:', dataMap)
    const result = buildOfflineContractInstance(tugouJson, dataMap)
    console.log('🚀 ~ it ~ result:', result)
    expect(result.N20.artifact.contract).is.eq('N20_Tugou')
  })

  it('offline mint verify successfully.', async () => {
    console.log('🚀 ~ it ~ dataMap:', dataMap)
    const result = offlineVerify(tugouJson, dataMap, 'mint')
    console.log('🚀 ~ it ~ result:', result)
    expect(result.success).is.true
  })
  it('offline transfer verify successfully.', async () => {
    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [1000, 100, 0] }
    let result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [1000, 100] }
    result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [1000, 100, 0, 1000] }
    result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.true

    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [100] }
    result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.false

    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [100, 9] }
    result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.false

    dataMap.transfer = { tick: stringToBytes(deployData.tick), outputs: [outputData, outputData, outputData], amt: [100, 0, 0, 100] }
    result = offlineVerify(tugouJson, dataMap, 'transfer')
    expect(result.success).is.false
  })
})
