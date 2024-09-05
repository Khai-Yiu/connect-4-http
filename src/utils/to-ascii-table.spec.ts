import toAsciiTable from '@/utils/to-ascii-table';
describe('to-ascii-table', () => {
    describe('given an empty grid', () => {
        it('returns an empty ascii table', () => {
            const asciiTable = toAsciiTable([]);
            expect(asciiTable).toEqual('');
        });
    });
    describe('given a one row grid', () => {
        describe('with one column', () => {
            describe('and a custom cell resolver', () => {
                it("uses the custom cell resolver to resolve the cell's value", () => {
                    const customResolver = (value: any) =>
                        value === null ? '💩' : '';

                    const asciiTable = toAsciiTable([[null]], customResolver);
                    expect(asciiTable).toEqual(`
|----|
| 💩 |
|----|`);
                });
            });
            describe('containing a string', () => {
                describe('and the string is empty', () => {
                    it('returns a 1x1 ascii table', () => {
                        const asciiTable = toAsciiTable([['']]);
                        expect(asciiTable).toEqual(`
|--|
|  |
|--|`);
                    });
                });
                describe('with content 1 character in length', () => {
                    it('returns a 1x1 ascii table', () => {
                        const asciiTable = toAsciiTable([['1']]);
                        expect(asciiTable).toEqual(`
|---|
| 1 |
|---|`);
                    });
                });
                describe('with content greater than 1 character in length', () => {
                    it('returns a 1x1 ascii table', () => {
                        const asciiTable = toAsciiTable([['10']]);
                        expect(asciiTable).toEqual(`
|----|
| 10 |
|----|`);
                    });
                });
            });
            describe("containing 'undefined'", () => {
                it('returns a 1x1 ascii table', () => {
                    const asciiTable = toAsciiTable([[undefined]]);
                    expect(asciiTable).toEqual(`
|--|
|  |
|--|`);
                });
            });
            describe('containing null', () => {
                it('returns a 1x1 ascii table', () => {
                    const asciiTable = toAsciiTable([[null]]);
                    expect(asciiTable).toEqual(`
|--|
|  |
|--|`);
                });
            });
        });
        describe('and multiple columns', () => {
            describe('of the same length', () => {
                it('returns an ascii table with 1 row and multiple columns', () => {
                    const asciiTable = toAsciiTable([[1, 1]]);
                    expect(asciiTable).toEqual(`
|---|---|
| 1 | 1 |
|---|---|`);
                });
            });
            describe('of different lengths', () => {
                it('returns an ascii table with 1 row and multiple columns', () => {
                    const asciiTable = toAsciiTable([[1, 11]]);
                    expect(asciiTable).toEqual(`
|---|----|
| 1 | 11 |
|---|----|`);
                });
            });
        });
    });
    describe('given a grid with multiple rows', () => {
        describe('and 1 column', () => {
            describe('where the content of each cell is of equal lengths', () => {
                it('returns an ascii table with multiple rows and 1 column', () => {
                    const asciiTable = toAsciiTable([[1], [2]]);
                    expect(asciiTable).toEqual(`
|---|
| 1 |
|---|
| 2 |
|---|`);
                });
            });
            describe('where the content of each cell is of different lengths', () => {
                it('returns an ascii table with multiple rows and 1 column', () => {
                    const asciiTable = toAsciiTable([[1], [11]]);
                    expect(asciiTable).toEqual(`
|----|
| 1  |
|----|
| 11 |
|----|`);
                });
            });
        });
    });
    describe('given a grid with multiple rows and columns', () => {
        describe('where the number of columns in each row are not equal', () => {
            it('throws an error', () => {
                expect(() => toAsciiTable([[1], [1, 1]])).toThrow(
                    Error('The number of columns within each row is not equal')
                );
            });
        });
        describe('where the content of each cell is of equal lengths', () => {
            it('returns an ascii table with multiple rows and columns', () => {
                const asciiTable = toAsciiTable([
                    [1, 1],
                    [1, 1]
                ]);
                expect(asciiTable).toEqual(`
|---|---|
| 1 | 1 |
|---|---|
| 1 | 1 |
|---|---|`);
            });
        });
        describe('where the content of each cell is of different lengths', () => {
            it('returns an ascii table with multiple rows and columns', () => {
                const asciiTable = toAsciiTable([
                    [1, 11],
                    [111, 1]
                ]);
                expect(asciiTable).toEqual(`
|-----|----|
| 1   | 11 |
|-----|----|
| 111 | 1  |
|-----|----|`);
            });
        });
        describe('and a custom cell resolver', () => {
            describe('where the content of each cell are different data types', () => {
                it('returns an ascii table with multiple rows and columns of resolved values', () => {
                    const customResolver = (value: any): string =>
                        value === null || value === undefined
                            ? '💩'
                            : `${value}`;
                    const asciiTable = toAsciiTable(
                        [
                            [undefined, 1],
                            [2, null]
                        ],
                        customResolver
                    );
                    expect(asciiTable).toEqual(`
|----|----|
| 💩 | 1  |
|----|----|
| 2  | 💩 |
|----|----|`);
                });
            });
        });
        describe('where the content of each cell are different data types', () => {
            it('returns an ascii table with multiple rows and columns', () => {
                const asciiTable = toAsciiTable([
                    [undefined, 1],
                    [2, null]
                ]);
                expect(asciiTable).toEqual(`
|---|---|
|   | 1 |
|---|---|
| 2 |   |
|---|---|`);
            });
        });
    });
});
