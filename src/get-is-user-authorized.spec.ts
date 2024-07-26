import { EncryptJWT, generateKeyPair } from 'jose';
import getIsUserAuthorized from '@/get-is-user-authorized';

describe('get-is-user-authorized', () => {
    describe('given a token', () => {
        describe('which cannot be decrypted using the private key', () => {
            it('returns false', async () => {
                const { privateKey } = await generateKeyPair('RS256');
                const token = '121321kek32di323f3';
                expect(
                    await getIsUserAuthorized(token, privateKey, 'hi@gmail.com')
                ).toBe(false);
            });
        });
        describe('which is expired', () => {
            it('returns false', async () => {
                const { publicKey, privateKey } =
                    await generateKeyPair('RS256');
                const token = await new EncryptJWT({
                    username: 'hi@gmail.com'
                })
                    .setProtectedHeader({
                        alg: 'RSA-OAEP-256',
                        enc: 'A128CBC-HS256'
                    })
                    .setExpirationTime('1 day ago')
                    .encrypt(publicKey);

                expect(
                    await getIsUserAuthorized(token, privateKey, 'hi@gmail.com')
                ).toBe(false);
            });
        });
        describe('which was not issued to the user', () => {
            it('returns false', async () => {
                const { publicKey, privateKey } =
                    await generateKeyPair('RS256');
                const token = await new EncryptJWT({
                    username: 'bye@gmail.com'
                })
                    .setProtectedHeader({
                        alg: 'RSA-OAEP-256',
                        enc: 'A128CBC-HS256'
                    })
                    .setExpirationTime('1 day from now')
                    .encrypt(publicKey);

                expect(
                    await getIsUserAuthorized(token, privateKey, 'hi@gmail.com')
                ).toBe(false);
            });
        });
        describe('which can be decrypted when using the private key', () => {
            it('returns true', async () => {
                const { publicKey, privateKey } =
                    await generateKeyPair('RS256');
                const token = await new EncryptJWT({
                    username: 'hi@gmail.com'
                })
                    .setProtectedHeader({
                        alg: 'RSA-OAEP-256',
                        typ: 'JWT',
                        enc: 'A256GCM'
                    })
                    .setExpirationTime('1 day from now')
                    .encrypt(publicKey);
                expect(
                    await getIsUserAuthorized(token, privateKey, 'hi@gmail.com')
                ).toBe(true);
            });
        });
    });
});
