import parseAsciiTable from '@/utils/parse-ascii-table';

describe('parse-ascii-table', () => {
    describe('given a table with no rows and columns', () => {
        it('returns an empty grid', () => {
            const emptyTable = '';
            expect(parseAsciiTable(emptyTable)).toEqual([]);
        });
    });
    describe('given a 1x1 ascii table', () => {
        describe('with an empty cell', () => {
            it('returns a 1x1 grid with an empty cell', () => {
                const table = `
|--|
|  |
|--|`;
                expect(parseAsciiTable(table)).toEqual([[undefined]]);
            });
        });
        describe('with a non-empty cell', () => {
            it('returns a 1x1 grid with a non-empty cell', () => {
                const table = `
|---|
| 1 |
|---|`;
                expect(parseAsciiTable(table)).toEqual([['1']]);
            });
            describe('and a customer cell resolver', () => {
                it('returns a 1x1 grid with a resolved value', () => {
                    const table = `
|---|
| 1 |
|---|`;
                    const customResolver = (value: string): number =>
                        Number(value);
                    expect(parseAsciiTable(table, customResolver)).toEqual([
                        [1]
                    ]);
                });
            });
            describe('with trailing whitespace', () => {
                it('returns a 1x1 grid trimming the trailing whitespace', () => {
                    const table = `
|----|
| 1  |
|----|`;
                    expect(parseAsciiTable(table)).toEqual([['1']]);
                });
            });
            describe('with leading whitespace', () => {
                it('returns a 1x1 grid without trimming the leading whitespace', () => {
                    const table = `
|----|
|  1 |
|----|`;
                    expect(parseAsciiTable(table)).toEqual([[' 1']]);
                });
            });
        });
    });
    describe('given a 2x1 ascii table', () => {
        describe('where all cells hold content of the same length', () => {
            it('returns a 2x1 grid', () => {
                const table = `
|---|
| 1 |
|---|
| 2 |
|---|`;
                expect(parseAsciiTable(table)).toEqual([['1'], ['2']]);
            });
        });
        describe('where all cells hold content of different length', () => {
            it('returns a 2x1 grid', () => {
                const table = `
|----|
| 1  |
|----|
| 10 |
|----|`;
                expect(parseAsciiTable(table)).toEqual([['1'], ['10']]);
            });
        });
    });
    describe('given a 1x2 ascii table', () => {
        describe('where all cells hold content of the same length', () => {
            it('returns a 1x2 grid', () => {
                const table = `
|---|---|
| 1 | 2 |
|---|---|`;
                expect(parseAsciiTable(table)).toEqual([['1', '2']]);
            });
        });
        describe('where all cells hold content of different length', () => {
            it('returns a 1x2 grid', () => {
                const table = `
|---|----|
| 1 | 10 |
|---|----|`;
                expect(parseAsciiTable(table)).toEqual([['1', '10']]);
            });
        });
    });
    describe('given a 2x2 ascii table', () => {
        it('returns a 2x2 grid', () => {
            const table = `
|----|----|
|  1 |    |
|----|----|
| 12 | 10 |
|----|----|`;
            expect(parseAsciiTable(table)).toEqual([
                [' 1', undefined],
                ['12', '10']
            ]);
        });
        describe('and a custom cell resolver', () => {
            it('returns a 2x2 grid with resolved values', () => {
                const table = `
|----|----|
|  1 |    |
|----|----|
| 12 | 10 |
|----|----|`;
                const customResolver = (
                    value: string
                ): string | number | undefined => {
                    const parsedValue = Number.parseInt(value);

                    if (value.length === 0) {
                        return undefined;
                    } else if (
                        !Number.isNaN(parsedValue) &&
                        value.length === value.trimStart().length
                    ) {
                        return parsedValue;
                    }

                    return value;
                };
                expect(parseAsciiTable(table, customResolver)).toEqual([
                    [' 1', undefined],
                    [12, 10]
                ]);
            });
        });
    });
});
