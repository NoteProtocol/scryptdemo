/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { N20_CLTV } from '../src/contracts/n20-cltv'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

import { offlineVerify } from 'scrypt-verify'
import cltvJson from '../artifacts/n20-cltv.json'

describe('Test SmartContract `N20_CLTV`', () => {
  let instance: N20_CLTV
  const lockHeight = 50720n
  before(async () => {
    await N20_CLTV.loadArtifact()

    instance = new N20_CLTV(lockHeight)

    await instance.connect(getDefaultSigner())
  })

  it('should offline verify failed', async () => {
    const dataMap = {
      constructor: {
        lockHeight,
      },
      transfer: { height: lockHeight - 1n },
    }

    const result = offlineVerify(cltvJson, dataMap, 'transfer')
    console.log('🚀 ~ result:', result)
    expect(result.success).is.false
  })

  it('should offline verify success', async () => {
    const dataMap = {
      constructor: {
        lockHeight,
      },
      transfer: { height: lockHeight },
    }

    const result = offlineVerify(cltvJson, dataMap, 'transfer')
    console.log('🚀 ~ result:', result)
    expect(result.success).is.true
  })

  it('should pass the public method unit test successfully.', async () => {
    const deployTx = await instance.deploy(1)

    const call = async () => {
      const callRes = await instance.methods.transfer(lockHeight)
      console.log('🚀 ~ call ~ callRes:', callRes)
    }
    await expect(call()).not.to.be.rejected
  })

  it('should throw with Tick does not match message.', async () => {
    await instance.deploy(1)

    const call = async () => instance.methods.transfer(lockHeight - 1n)
    await expect(call()).to.be.rejectedWith(/Height must be valid/)
  })
})
