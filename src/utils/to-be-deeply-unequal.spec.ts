describe('toBeDeeplyUnequal', () => {
    it('should fail when given objects are the same object', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = obj1;
        expect(obj1).not.toBeDeeplyUnequal(obj2);
    });
    it('should pass when objects are unequal at a shallow level', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };
        expect(obj1).toBeDeeplyUnequal(obj2);
    });
    it('should pass when one object has additional keys', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2, c: 3 };
        expect(obj1).toBeDeeplyUnequal(obj2);
    });
    it('should fail when the first object has an additional key and share an array as a value', () => {
        const innerArray: any[] = [];
        const obj1 = { a: 1, b: innerArray, c: 3 };
        const obj2 = { a: 1, b: innerArray };
        expect(obj1).not.toBeDeeplyUnequal(obj2);
    });
    it('should fail when the second object has an additional key and share an array as a value', () => {
        const innerArray: any[] = [];
        const obj1 = { a: 1, b: innerArray };
        const obj2 = { a: 1, b: innerArray, c: 3 };
        expect(obj1).not.toBeDeeplyUnequal(obj2);
    });
    it('should pass when given objects are different objects', () => {
        const obj1 = {};
        const obj2 = {};
        expect(obj1).toBeDeeplyUnequal(obj2);
    });
    it('should pass given an object and an array', () => {
        const arr: any[] = [];
        const obj = {};
        expect(arr).toBeDeeplyUnequal(obj);
    });
    it('should pass given null and an object', () => {
        const obj = {};
        expect(obj).toBeDeeplyUnequal(null);
    });
    it('should pass given undefined and an object', () => {
        const obj = {};
        expect(obj).toBeDeeplyUnequal(undefined);
    });
    it('should pass when the objects are deeply unequal at a nested level', () => {
        const obj1 = { a: {} };
        const obj2 = { a: {} };
        expect(obj1).toBeDeeplyUnequal(obj2);
    });
    it('should fail when the objects are not deeply equal at a nested level', () => {
        const innerObj = {};
        const obj1 = { a: innerObj };
        const obj2 = { a: innerObj };
        expect(obj1).not.toBeDeeplyUnequal(obj2);
    });
    it('should fail when given the same arrays', () => {
        const arr1: any[] = [];
        const arr2 = arr1;
        expect(arr1).not.toBeDeeplyUnequal(arr2);
    });
    it('should pass when given different arrays', () => {
        const arr1: any[] = [];
        const arr2: any[] = [];
        expect(arr1).toBeDeeplyUnequal(arr2);
    });
    it('should pass given two arrays that are unequal at a shallow level', () => {
        const arr1 = [1, 2];
        const arr2 = [2, 3];
        expect(arr1).toBeDeeplyUnequal(arr2);
    });
    it('should fail given two arrays that are equal at a shallow level', () => {
        const innerArr: any[] = [];
        const arr1 = [innerArr];
        const arr2 = [innerArr];
        expect(arr1).not.toBeDeeplyUnequal(arr2);
    });
    it('should pass when the first array has an extra value and are unequal', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2];
        expect(arr1).toBeDeeplyUnequal(arr2);
    });
    it('should pass when the second array has an extra value and are unequal', () => {
        const arr1 = [1, 2];
        const arr2 = [1, 2, 3];
        expect(arr1).toBeDeeplyUnequal(arr2);
    });
    it('should pass given two arrays are deeply unequal at a nested level', () => {
        const arr1 = [[]];
        const arr2 = [[]];
        expect(arr1).toBeDeeplyUnequal(arr2);
    });
});
