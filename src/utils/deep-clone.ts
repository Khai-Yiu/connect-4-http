function deepClone<T>(
    value: T,
    visited: WeakMap<any, any> = new WeakMap<any, any>()
): T {
    if (!(value instanceof Object) || typeof value === 'function') {
        return value;
    }

    if (visited.has(value)) {
        return visited.get(value);
    }

    const clone: T = Array.isArray(value) ? ([] as T) : ({} as T);
    const objOrArrayValue = value as { [key: string | symbol]: any };
    const stringAndSymbolKeys = [
        ...Object.keys(objOrArrayValue),
        ...Object.getOwnPropertySymbols(objOrArrayValue)
    ];
    visited.set(value, clone);

    for (const key of stringAndSymbolKeys) {
        (clone as any)[key] = deepClone(objOrArrayValue[key], visited);
    }

    return clone;
}

export default deepClone;
