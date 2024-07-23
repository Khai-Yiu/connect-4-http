import { KeyLike } from 'jose';

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;
export type Stage = 'production' | 'test';
export type JwtPublicKey = KeyLike;
export type jwtPrivateKey = KeyLike;
export type KeySet = {
    jwtPublicKey?: JwtPublicKey;
};
