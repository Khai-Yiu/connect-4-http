import { jwtDecrypt, jwtVerify, KeyLike } from 'jose';
import { JWEInvalid, JWTExpired } from 'jose/errors';

const getIsUserAuthorized = async (
    token: string,
    privateKey: KeyLike,
    email: string
) => {
    try {
        const { payload } = await jwtDecrypt(token, privateKey);

        if (payload.username !== email) {
            return false;
        }
    } catch (error) {
        if (error instanceof JWEInvalid || error instanceof JWTExpired) {
            return false;
        }
    }
};

export default getIsUserAuthorized;
