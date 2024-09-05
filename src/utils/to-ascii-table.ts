function createBorder(largestCharacterWidthPerColumn: Array<number>): string {
    return largestCharacterWidthPerColumn.reduce(
        (border, currentWidth) => border + `${'-'.repeat(currentWidth + 2)}|`,
        '|'
    );
}

const defaultResolver = <T>(value: T): string =>
    value === null || value === undefined ? '' : `${value}`;

function getLargestCharacterWidthPerColumn<T>(
    grid: Array<Array<T>>,
    cellResolver: (value: any) => string
) {
    return grid.reduce((maxColumnWidths, currentRow) => {
        currentRow.forEach((currentElement, columnIndex) => {
            const resolvedElement = cellResolver(currentElement);
            if (resolvedElement.length > maxColumnWidths[columnIndex]) {
                maxColumnWidths[columnIndex] = resolvedElement.length;
            }
        });

        return [...maxColumnWidths];
    }, Array(grid[0].length).fill(0));
}

function getPaddedContent(
    value: string,
    widthOfLargestCellContentInColumn: number
): string {
    return ` ${value.padEnd(widthOfLargestCellContentInColumn, ' ')} `;
}

function validateGridDimensions<T>(grid: Array<Array<T>>) {
    const knownRowLength = grid[0].length;

    grid.forEach((row) => {
        if (row.length !== knownRowLength) {
            throw new Error(
                'The number of columns within each row is not equal'
            );
        }
    });
}

function toAsciiTable<T>(
    grid: Array<Array<T>>,
    cellResolver: (value: any) => string = defaultResolver
): string {
    if (grid.length === 0) {
        return '';
    }
    validateGridDimensions(grid);

    const largestCharacterWidthPerColumn = getLargestCharacterWidthPerColumn(
        grid,
        cellResolver
    );
    const tableRows = grid.reduce((tableRows, currentRow) => {
        tableRows.push(
            currentRow.reduce((rowContent, currentElement, currentIndex) => {
                const paddedContent = getPaddedContent(
                    cellResolver(currentElement),
                    largestCharacterWidthPerColumn[currentIndex]
                );
                return rowContent.concat(`${paddedContent}|`);
            }, '|')
        );

        return tableRows;
    }, [] as Array<String>);

    const border = createBorder(largestCharacterWidthPerColumn);

    return ['', border, tableRows.join('\n' + border + '\n'), border].join(
        '\n'
    );
}

export default toAsciiTable;
