declare module 'expect' {
    interface AsymmetricMatchers {
        toBeUuid(received: string): void;
    }
    interface Matchers<R> {
        toBeUuid(received: string): R;
    }
}
