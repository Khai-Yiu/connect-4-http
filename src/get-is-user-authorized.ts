import { jwtDecrypt, KeyLike } from 'jose';
import { JWEInvalid, JWTExpired } from 'jose/errors';

const getIsUserAuthorized = async (
    authorizationField: string,
    privateKey: KeyLike,
    email: string
) => {
    try {
        const token = authorizationField.split(' ')[1];
        const { payload } = await jwtDecrypt(token, privateKey);

        if (payload.username !== email) {
            return false;
        }

        return true;
    } catch (error) {
        if (error instanceof JWEInvalid || error instanceof JWTExpired) {
            return false;
        }

        return false;
    }
};

export default getIsUserAuthorized;
