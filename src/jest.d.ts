interface CustomMatchers<R = jest.CustomMatcherResult> {
    toBeUuid(): R;
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Assertion<R> extends CustomMatchers<R> {}
        interface Matchers<R> extends CustomMatchers<R> {}
    }
}

export {};
