/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { N20_Oracle } from '../src/contracts/n20-oracle'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { Rabin, RabinPrivateKey, RabinPublicKey, toRabinSig } from 'rabinsig'

import { offlineVerify } from 'scrypt-verify'
import oracleJson from '../artifacts/n20-oracle.json'
import { toByteString } from 'scrypt-ts'
import { num2bin } from 'scryptlib'

describe('Test SmartContract `N20_Oracle`', () => {
  let instance: N20_Oracle
  const lockHeight = 50720n

  const securityLevel = 1
  let oraclePrivKey: RabinPrivateKey
  let oraclePubKey: RabinPublicKey

  before(async () => {
    const rabin = new Rabin(securityLevel)
    const privKey = rabin.generatePrivKey()
    const pubKey = rabin.privKeyToPubKey(privKey)
    console.log('🚀 ~ before ~ Keys:', privKey, pubKey)
    oraclePrivKey = privKey
    oraclePubKey = pubKey

    await N20_Oracle.loadArtifact()

    instance = new N20_Oracle(oraclePubKey, toByteString('NOTE', true), 2100n * 10000n, 5000n, 8n, lockHeight)

    await instance.connect(getDefaultSigner())
  })

  it('should offline verify success', function () {
    this.timeout(10000) // 10 seconds

    const tick = toByteString('NOTE', true)
    const amt = 1000n
    const total = 0n
    const msg = tick + num2bin(amt, 16)
    const rabin = new Rabin(securityLevel)

    const rabinSig = rabin.sign(msg, oraclePrivKey)
    console.log('🚀 ~ it ~ oracleSig:', rabinSig)
    const verify = rabin.verify(msg, rabinSig, oraclePubKey)
    console.log('🚀 ~ it ~ verify:', verify)
    expect(verify).is.true
    const oracleSig = toRabinSig(rabinSig)
    console.log('🚀 ~ it ~ oracleSig:', oracleSig)
    const dataMap = {
      constructor: {
        p: toByteString('n20', true),
        tick: toByteString('NOTE', true),
        max: 2100000000000000n,
        lim: 500000000000n,
        dec: 8n,
        oraclePubKey,
        lockHeight,
      },
      mint: { oracleSig, tick, amt, total },
    }

    const result = offlineVerify(oracleJson, dataMap, 'mint')
    console.log('🚀 ~ result:', result)
    expect(result.success).is.true
  })

  it('should offline verify failed', function () {
    this.timeout(10000) // 10 seconds

    const tick = toByteString('NOTE', true)
    const amt = 1000n
    const total = 0n
    const msg = tick + num2bin(amt, 16)
    const rabin = new Rabin(securityLevel)
    const privKey = rabin.generatePrivKey()
    // const pubKey = rabin.privKeyToPubKey(privKey)

    const rabinSig = rabin.sign(msg, privKey)
    console.log('🚀 ~ it ~ oracleSig:', rabinSig)
    const verify = rabin.verify(msg, rabinSig, oraclePubKey)
    console.log('🚀 ~ it ~ verify:', verify)
    expect(verify).is.false
    const oracleSig = toRabinSig(rabinSig)
    console.log('🚀 ~ it ~ oracleSig:', oracleSig)
    const dataMap = {
      constructor: {
        p: toByteString('n20', true),
        tick: toByteString('NOTE', true),
        max: 2100000000000000n,
        lim: 500000000000n,
        dec: 8n,
        oraclePubKey,
        lockHeight,
      },
      mint: { oracleSig, tick, amt, total },
    }

    const result = offlineVerify(oracleJson, dataMap, 'mint')
    console.log('🚀 ~ result:', result)
    expect(result.success).is.false
  })

  it('should pass the public method unit test successfully.', async function () {
    this.timeout(10000) // 10 seconds

    const deployTx = await instance.deploy(1)
    const tick = toByteString('NOTE', true)
    const amt = 1000n
    const total = 0n
    const msg = tick + num2bin(amt, 16)
    const rabin = new Rabin(securityLevel)

    const rabinSig = rabin.sign(msg, oraclePrivKey)
    console.log('🚀 ~ it ~ oracleSig:', rabinSig)
    const verify = rabin.verify(msg, rabinSig, oraclePubKey)
    console.log('🚀 ~ it ~ verify:', verify)
    expect(verify).is.true
    const oracleSig = toRabinSig(rabinSig)
    console.log('🚀 ~ it ~ oracleSig:', oracleSig)

    const call = async () => {
      const callRes = await instance.methods.mint(tick, amt, total, oracleSig)
      console.log('🚀 ~ call ~ callRes:', callRes)
    }
    await expect(call()).not.to.be.rejected
  })

  it('should throw with Tick does not match message.', async function () {
    this.timeout(10000) // 10 seconds

    await instance.deploy(1)
    const tick = toByteString('NOTE', true)
    const amt = 1000n
    const total = 0n
    const msg = tick + num2bin(amt, 16)
    const rabin = new Rabin(securityLevel)
    const privKey = rabin.generatePrivKey()
    // const pubKey = rabin.privKeyToPubKey(privKey)

    const rabinSig = rabin.sign(msg, privKey)
    console.log('🚀 ~ it ~ oracleSig:', rabinSig)
    const verify = rabin.verify(msg, rabinSig, oraclePubKey)
    console.log('🚀 ~ it ~ verify:', verify)
    expect(verify).is.false
    const oracleSig = toRabinSig(rabinSig)
    console.log('🚀 ~ it ~ oracleSig:', oracleSig)

    const call = async () => instance.methods.mint(tick, amt, total, oracleSig)
    await expect(call()).to.be.rejected
  })
})
