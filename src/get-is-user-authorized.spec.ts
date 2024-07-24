import { generateKeyPair } from 'jose';
import getIsUserAuthorized from '@/get-is-user-authorized';

describe('get-is-user-authorized', () => {
    describe('given a token', () => {
        describe('which cannot be decrypted using the private key', () => {
            it('returns false', async () => {
                const { privateKey } = await generateKeyPair('RS256');
                const token = '121321kek32di323f3';
                expect(await getIsUserAuthorized(token, privateKey)).toBe(
                    false
                );
            });
        });
    });
});
