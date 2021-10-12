export declare enum UpdatedValues {
    first = 1,
    second = 2,
    both = 3,
    bothWithDeepDiff = 4
}
declare type CompareFunction<A> = (value: A, other: A) => boolean;
declare type ReturnTypeNormal<T> = {
    same: T[];
    added: T[];
    updated: T[];
    removed: T[];
};
declare type ReturnTypeBoth<T> = {
    same: T[];
    added: T[];
    updated: [T, T][];
    removed: T[];
};
declare class Wrapper<T> {
    wrapped(e: T): import("deep-diff").Diff<T, T>[] | undefined;
}
declare type FooInternalType<T> = ReturnType<Wrapper<T>['wrapped']>;
declare type ReturnTypeDeepDiff<T> = {
    same: T[];
    added: T[];
    updated: [T, T, FooInternalType<T>][];
    removed: T[];
};
declare function diff<T>(first: T[], second: T[], idField: keyof T, options?: {
    compareFunction?: CompareFunction<T>;
    updatedValues?: UpdatedValues.first;
}): ReturnTypeNormal<T>;
declare function diff<T>(first: T[], second: T[], idField: keyof T, options?: {
    compareFunction?: CompareFunction<T>;
    updatedValues?: UpdatedValues.second;
}): ReturnTypeNormal<T>;
declare function diff<T>(first: T[], second: T[], idField: keyof T, options?: {
    compareFunction?: CompareFunction<T>;
    updatedValues?: UpdatedValues.both;
}): ReturnTypeBoth<T>;
declare function diff<T>(first: T[], second: T[], idField: keyof T, options?: {
    compareFunction?: CompareFunction<T>;
    updatedValues?: UpdatedValues.bothWithDeepDiff;
}): ReturnTypeDeepDiff<T>;
declare namespace diff {
    var updatedValues: typeof UpdatedValues;
}
export default diff;
//# sourceMappingURL=index.d.ts.map