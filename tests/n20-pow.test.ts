/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, use } from 'chai'
import { hash256, toByteString } from 'scrypt-ts'
import { N20_Pow } from '../src/contracts/n20-pow'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
import { stringToBytes } from 'scryptlib'
import { offlineVerify } from 'scrypt-verify'
import powJson from '../artifacts/n20-pow.json'

function mockData() {
    const btcTx = toByteString(
        '0200000000010266e273f871759c9b2d98a172eb302c14e59daafbff5fb79a8b03109b45c581370000000000ffffffffcfa6237355f38b04bbeeae1afc4f3e9c5ef77305f9afa90742d37a1782f7ab6b0100000000ffffffff022202000000000000225120fb1397257ecba1b51739192853c08209235bb662482eaebf6556170442d7f050874c080000000000160014bc5fa59b7108e0ec633e66233684bef4d4dbad480340b0c0c9c2b371a03ec4617139750610aeff3cc3844a242aa089d826835ef40c23597abd0c12cef2e7ad4f4f61c04d572c97acf95548bf7092f7e6fa67b22f4a8d552684a3616d74cf000000746a528800a26f70a46d696e74a170a36e3230a47469636ba44e4f544500000000044e4f54456d6d6d20da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b115ac41c0da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b1152a56124065fd50baecd89ca4204fbfaa0b66021d78891c9b7b9255a11b1341140247304402205a3772c8a6bd58237a7b19baafce25d1bee8e395c4b22653732fc31e1f2df903022057725f6ff98802a35b3377d9e0c809f041cc916b364be880bc61745bd487ae96012102da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b11505340000'
    )

    console.log(hash256(btcTx))

    return {
        tx: btcTx,
    }
}

describe('Test SmartContract `N20_Pow`', () => {
    let instance: N20_Pow

    before(async () => {})

    async function testVerify() {
        const dataMap = {
            constructor: {
                p: '6e3230',
                op: '6465706c6f79',
                tick: '4e4f5445',
                max: 2100000000000000n,
                lim: 500000000000n,
                dec: 8,
                sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
                start: 27530,
                bitwork: '3230',
            },
            mint: {
                p: '6e3230',
                op: '6d696e74',
                tick: '4e4f5445',
                max: 2100000000000000n,
                lim: 500000000000n,
                dec: 8,
                sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
                start: 27530,
                bitwork: '3230',
                amt: 500000000000n,
                height: 27577,
                // total: 0n,
                tx: '0200000000010266e273f871759c9b2d98a172eb302c14e59daafbff5fb79a8b03109b45c581370000000000ffffffffcfa6237355f38b04bbeeae1afc4f3e9c5ef77305f9afa90742d37a1782f7ab6b0100000000ffffffff022202000000000000225120fb1397257ecba1b51739192853c08209235bb662482eaebf6556170442d7f050874c080000000000160014bc5fa59b7108e0ec633e66233684bef4d4dbad480340b0c0c9c2b371a03ec4617139750610aeff3cc3844a242aa089d826835ef40c23597abd0c12cef2e7ad4f4f61c04d572c97acf95548bf7092f7e6fa67b22f4a8d552684a3616d74cf000000746a528800a26f70a46d696e74a170a36e3230a47469636ba44e4f544500000000044e4f54456d6d6d20da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b115ac41c0da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b1152a56124065fd50baecd89ca4204fbfaa0b66021d78891c9b7b9255a11b1341140247304402205a3772c8a6bd58237a7b19baafce25d1bee8e395c4b22653732fc31e1f2df903022057725f6ff98802a35b3377d9e0c809f041cc916b364be880bc61745bd487ae96012102da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b11505340000',
            },
            transfer: { tick: '4e4f5445' },
        }
        console.log('🚀 ~ it ~ dataMap:', dataMap)
        const result = offlineVerify(powJson, dataMap, 'mint')
        console.log('🚀 ~ it ~ result:', result)
        expect(result.success).is.true
        return { success: false, error: result, result: { success: true, txId: '' } }
    }

    it('should pass the public method unit test successfully.', async () => {
        await N20_Pow.loadArtifact()

        instance = new N20_Pow(toByteString('NOTE', true), 2100n * 10000n, 5000n, 8n, toByteString('20', true), 27530n)

        await instance.connect(getDefaultSigner())

        const deployTx = await instance.deploy(1000)
        const { tx } = mockData()

        const call = async () => {
            {
                const callRes = await instance.methods.mint(toByteString('NOTE', true), 2500n, (2100n * 10000n * 3n) / 4n - 1n, 27530n, tx)
            }
        }
        await expect(call()).not.to.be.rejected
    })

    it('should offchain verify success.', async () => {
        const deployTx = await instance.deploy(1000)

        // const lockingScript = deployTx.outputs[ 0 ].script
        // const preimage = getPreimage( deployTx, lockingScript, 1000, 0 )
        const { tx } = mockData()

        // const deployTxHex = deployTx.serialize()

        const dataMap = {
            constructor: {
                tick: stringToBytes('NOTE'),
                max: 21000000n * 10n ** 8n,
                lim: 5000n * 10n ** 8n,
                dec: 8,
                start: 27530,
                bitwork: stringToBytes('20'),
            },
            mint: {
                tick: stringToBytes('NOTE'),
                amt: 5000n * 10n ** 8n,
                height: 27572,
                tx: tx,
                prevTx: stringToBytes(''),
                total: 0,
                max: 21000000n * 10n ** 8n,
                lim: 5000n * 10n ** 8n,
                dec: 8,
                start: 27530,
                bitwork: stringToBytes('20'),
            },
            transfer: {
                tick: stringToBytes('NOTE'),
                amt: 1000n * 10n ** 8n,
            },
        }
        console.log('🚀 ~ it ~ dataMap:', dataMap)

        const result = offlineVerify(powJson, dataMap, 'mint')
        console.log('🚀 ~ it ~ result:', result)
        expect(result.success).is.true
    })

    it('should offchain verify success. again', async () => {
        console.log(testVerify())
        // const dataMap = {
        //     constructor: {
        //         p: '6e3230',
        //         op: '6465706c6f79',
        //         tick: '4e4f5445',
        //         max: 2100000000000000n,
        //         lim: 500000000000n,
        //         dec: 8,
        //         sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
        //         start: 27530,
        //         bitwork: '3230',
        //     },
        //     mint: {
        //         p: '6e3230',
        //         op: '6d696e74',
        //         tick: '4e4f5445',
        //         max: 2100000000000000n,
        //         lim: 500000000000n,
        //         dec: 8,
        //         sch: '50b13619d4d936d7c5c7fb7dfbe752e33b85b33774e9e2b3779f16791fb1c749',
        //         start: 27530,
        //         bitwork: '3230',
        //         amt: 500000000000n,
        //         height: 27577,
        //         total: 0n,
        //         tx: '0200000000010266e273f871759c9b2d98a172eb302c14e59daafbff5fb79a8b03109b45c581370000000000ffffffffcfa6237355f38b04bbeeae1afc4f3e9c5ef77305f9afa90742d37a1782f7ab6b0100000000ffffffff022202000000000000225120fb1397257ecba1b51739192853c08209235bb662482eaebf6556170442d7f050874c080000000000160014bc5fa59b7108e0ec633e66233684bef4d4dbad480340b0c0c9c2b371a03ec4617139750610aeff3cc3844a242aa089d826835ef40c23597abd0c12cef2e7ad4f4f61c04d572c97acf95548bf7092f7e6fa67b22f4a8d552684a3616d74cf000000746a528800a26f70a46d696e74a170a36e3230a47469636ba44e4f544500000000044e4f54456d6d6d20da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b115ac41c0da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b1152a56124065fd50baecd89ca4204fbfaa0b66021d78891c9b7b9255a11b1341140247304402205a3772c8a6bd58237a7b19baafce25d1bee8e395c4b22653732fc31e1f2df903022057725f6ff98802a35b3377d9e0c809f041cc916b364be880bc61745bd487ae96012102da6c71b73fb5462258b16c60f30465fc5985fe9e63610e671f7c8bfddab3b11505340000',
        //     },
        //     transfer: { tick: '4e4f5445' },
        // }
        // console.log('🚀 ~ it ~ dataMap:', dataMap)

        // const result = offlineVerify(powJson, dataMap, 'mint')
        // console.log('🚀 ~ it ~ result:', result)
        // expect(result.success).is.true
    })

    it('test limit', async () => {
        const deployTx = await instance.deploy(1000)
        const { tx } = mockData()

        function test(start, height, total, amt) {
            const dataMap = {
                constructor: {
                    tick: stringToBytes('NOTE'),
                    max: 2100n * 10000n * 10n ** 8n,
                    lim: 5000n * 10n ** 8n,
                    dec: 8n,
                    start,
                    bitwork: toByteString('20', true),
                },
                mint: {
                    tick: stringToBytes('NOTE'),
                    amt,
                    height,
                    tx: tx,
                    prevTx: stringToBytes(''),
                    total,
                },
            }

            return offlineVerify(powJson, dataMap, 'mint')
        }

        expect(test(827000n, 827000n - 1n, 0n, 5000n * 10n ** 8n).success).is.false

        //Test Block Hieght
        for (let i = 0; i < 7; i++) {
            const a = BigInt(2 ** i)

            expect(test(827000n, 827000n + 1000n * BigInt(i + 1) - 1n, 0n, (5000n * 10n ** 8n) / a).success).is.true
            expect(test(827000n, 827000n + 1000n * BigInt(i + 1), 0n, (5000n * 10n ** 8n) / a).success).is.false
        }
        expect(test(827000n, 827000n + 1000n * 7n, 0n, (5000n * 10n ** 8n) / 2n ** 7n).success).is.true
        expect(test(827000n, 827000n + 1000n * 8n, 0n, (5000n * 10n ** 8n) / 2n ** 7n).success).is.true
        expect(test(827000n, 827000n + 1000n * 9n, 0n, (5000n * 10n ** 8n) / 2n ** 7n).success).is.true

        //Test Total Amount
        for (let i = 0; i < 7; i++) {
            const a = BigInt(2 ** i)
            const b = BigInt(2 ** (i + 1))
            expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * (b - 1n)) / b - 1n, (5000n * 10n ** 8n) / a).success).is.true
            expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * (b - 1n)) / b, (5000n * 10n ** 8n) / a).success).is.false
        }
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 127n) / 128n - 1n, (5000n * 10n ** 8n) / 128n).success).is.true
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 127n) / 128n, (5000n * 10n ** 8n) / 128n).success).is.true
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 255n) / 256n - 1n, (5000n * 10n ** 8n) / 128n).success).is.true
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 255n) / 256n, (5000n * 10n ** 8n) / 128n).success).is.true
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 511n) / 512n - 1n, (5000n * 10n ** 8n) / 128n).success).is.true
        expect(test(827000n, 827000n, (2100n * 10000n * 10n ** 8n * 511n) / 512n, (5000n * 10n ** 8n) / 128n).success).is.true
    })
})
