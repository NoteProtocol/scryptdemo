/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { toByteString } from 'scrypt-ts'
import { N20_Simple } from '../src/contracts/n20-simple'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

import { stringToBytes } from 'scryptlib'
import { offlineVerify } from 'scrypt-verify'
import simpleJson from '../artifacts/n20-simple.json'

describe('Test SmartContract `N20_Simple`', () => {
    let instance: N20_Simple

    before(async () => {
        await N20_Simple.loadArtifact()

        instance = new N20_Simple(toByteString('NOTE', true), 21000000n * 10n ** 8n, 1000n * 10n ** 8n, 8n)

        await instance.connect(getDefaultSigner())
    })

    it('should offline verify', async () => {
        const dataMap = {
            constructor: {
                tick: stringToBytes('NOTE'),
                max: 21000000n * 10n ** 8n,
                lim: 1000n * 10n ** 8n,
                dec: 8n,
            },
            mint: { tick: stringToBytes('NOTE'), amt: 1000n * 10n ** 8n, total: 5000n * 10n ** 8n },
            transfer: { tick: stringToBytes('NOTE'), amt: 1000n * 10n ** 8n },
        }

        const result = offlineVerify(simpleJson, dataMap, 'mint')
        console.log('🚀 ~ result:', result)
        expect(result.success).is.true
    })

    it('should pass the public method unit test successfully.', async () => {
        const deployTx = await instance.deploy(1)

        const call = async () => {
            const callRes = await instance.methods.mint(toByteString('NOTE', true), 1000n * 10n ** 8n, 5000n * 10n ** 8n)
        }
        await expect(call()).not.to.be.rejected
    })

    it('should throw with Tick does not match message.', async () => {
        await instance.deploy(1)

        const call = async () => instance.methods.mint(toByteString('AAAA', true), 1000n * 10n ** 8n, 5000n * 10n ** 8n)
        await expect(call()).to.be.rejectedWith(/Tick does not match/)
    })

    it('should throw with Amount check failed message.', async () => {
        await instance.deploy(1)

        const call = async () => instance.methods.mint(toByteString('NOTE', true), 1001n * 10n ** 8n, 5000n * 10n ** 8n)
        await expect(call()).to.be.rejectedWith(/Amount check failed/)
    })
})
