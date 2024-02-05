import { expect, use } from 'chai'
import { hash256, toByteString } from 'scrypt-ts'
import { N20_Note } from '../src/contracts/n20-note'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { stringToBytes } from 'scryptlib'
import { bigint2buffer, offlineVerify } from '../src/note-verify'
import noteJson from '../artifacts/n20-note.json'

function mockData() {
    const btcTx = toByteString(
        '02000000000102c43df943fdc96bf5f942a50c69a8f70bf03f9e14c26c30dde4324fa657f11a3100000000001e280000c43df943fdc96bf5f942a50c69a8f70bf03f9e14c26c30dde4324fa657f11a310100000000ffffffff022202000000000000225120531d2d23cfede5a9242cc42a090cd458c4a03dbbf624110849636ff53093d3221f1f00000000000016001404a1c0e250c1a44382279339a52bbee9c4d3ce780840af3673d0af6b43a18316e978fdbd747700cd20f6b8ae049369a6262b61f30cc54f94d5a9229d1161a5739043d12edfaec68b9b30478add7e8b2357485f9f5e18242384a3616d74c4050088526a74a26f70a46d696e74a170a36e3230a47469636ba35a5a5a01000100010001002a044e4f54456d6d6d2028e2e7e382eec1f6b6fdf66550f43ee47b75b65f536813be506674a5873c8b36ac41c028e2e7e382eec1f6b6fdf66550f43ee47b75b65f536813be506674a5873c8b36889b99711b2815f212fc8dc820cb4f2e292dff53cf09c860ec5ab746b4977d9202473044022055622059d94c1cd3578ac947c79b2e5f710aed577fb85cc2d3fa5523bc70c7aa02200ba9f423129f10ce8df5a2722f1f52cca4d362ae1338b33e1b6ceb4da74a477601210228e2e7e382eec1f6b6fdf66550f43ee47b75b65f536813be506674a5873c8b3600000000'
    )

    return {
        tx: btcTx,
    }
}

describe('Test SmartContract `N20_Note`', () => {
    let instance: N20_Note

    before(async () => {
        await N20_Note.loadArtifact()

        instance = new N20_Note()

        await instance.connect(getDefaultSigner())
    })

    it('should pass the public method unit test successfully.', async () => {
        const deployTx = await instance.deploy(1000)
        const { tx } = mockData()

        const call = async () => {
            {
                const callRes = await instance.methods.mint(toByteString('NOTE', true), 2500n * 10n ** 8n, 5000n * 10n ** 8n, 2576600n, tx)
            }
        }
        await expect(call()).not.to.be.rejected
    })

    it('should offchain verify success.', async () => {
        const deployTx = await instance.deploy(1000)
        const { tx } = mockData()

        const dataMap = {
            mint: {
                tick: stringToBytes('NOTE'),
                amt: bigint2buffer(1000n * 10n ** 8n),
                height: 2576600n,
                tx: tx,
                prevTx: stringToBytes(''),
                total: 0n,
            },
            transfer: {
                tick: stringToBytes('NOTE'),
                amt: bigint2buffer(1000n * 10n ** 8n),
            },
        }

        const result = offlineVerify(noteJson, dataMap, 'mint')
        expect(result.success).is.true
    })
})
