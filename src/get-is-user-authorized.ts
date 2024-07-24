import { jwtDecrypt, KeyLike } from 'jose';
import { JWEInvalid, JWTExpired } from 'jose/errors';

const getIsUserAuthorized = async (
    token: string,
    privateKey: KeyLike,
    email: string
) => {
    try {
        const { payload } = await jwtDecrypt(token, privateKey);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);

        if (payload.exp && currentTimeInSeconds > payload.exp) {
            return false;
        }
    } catch (error) {
        if (error instanceof JWEInvalid || error instanceof JWTExpired) {
            return false;
        }
    }
};

export default getIsUserAuthorized;