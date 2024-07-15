import toBeUuid from './to-be-uuid';

describe('toBeUuid', () => {
    describe('given a valid v4 UUID string', () => {
        it('returns a positive MatcherResult', () => {
            const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';

            expect(toBeUuid(validUuid)).toEqual({
                pass: true,
                message: expect.any(Function)
            });
        });
        it('returns the message function that indicates the UUID is invalid when invoked', () => {
            const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
            const { message } = toBeUuid(validUuid);

            expect(message()).toEqual(`${validUuid} is an invalid v4 UUID`);
        });
        describe('and we use the negated matcher', () => {
            it('should return a negative MatchResult', () => {
                const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
                const negatedToBeUuid = toBeUuid.bind({ isNot: true });

                expect(negatedToBeUuid(validUuid)).toEqual({
                    pass: true,
                    message: expect.any(Function)
                });
            });
            it('returns a message function that indicates the UUID is invalid when invoked', () => {
                const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
                const negatedToBeUuid = toBeUuid.bind({ isNot: true });
                const { message } = negatedToBeUuid(validUuid);
                expect(message()).toEqual(`${validUuid} is a valid v4 UUID`);
            });
        });
    });
    describe('given an invalid v4 UUID string', () => {
        it('returns a negative MatcherResult', () => {
            const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';

            expect(toBeUuid(invalidUuid)).toEqual({
                pass: false,
                message: expect.any(Function)
            });
        });
        it('returns the message function that indicates an invalid message when invoked', () => {
            const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
            const { message } = toBeUuid(invalidUuid);

            expect(message()).toEqual(`${invalidUuid} is an invalid v4 UUID`);
        });
        describe('and we use the negated matcher', () => {
            it('returns a positive MatcherResult', () => {
                const invalidUuid =
                    '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
                const negatedToBeUuid = toBeUuid.bind({ isNot: true });

                expect(negatedToBeUuid(invalidUuid)).toEqual({
                    pass: false,
                    message: expect.any(Function)
                });
            });
            it('returns a message function that indicates the UUID is valid when invoked', () => {
                const invalidUuid =
                    '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
                const negatedToBeUuid = toBeUuid.bind({ isNot: true });
                const { message } = negatedToBeUuid(invalidUuid);

                expect(message()).toEqual(`${invalidUuid} is a valid v4 UUID`);
            });
        });
    });
});
