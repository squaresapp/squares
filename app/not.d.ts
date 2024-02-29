/**
 * Utility class for performing basic guarding.
 */
declare namespace Not {
    /**
     * @returns The argument as specified, but throws an
     * exception in the case when it's null or undefined.
     */
    function nullable<T>(param: T): NonNullable<T>;
    /**
     * @returns The argument as specified, but throws an
     * exception in the case when the value provided equates
     * to a JavaScript-falsey value.
     */
    function falsey<T>(value: T): NonNullable<T>;
    /**
     * Used to mark out areas of the code that are not implemented.
     */
    function implemented(): void;
    /**
     *
     */
    function reachable(): never;
}
//# sourceMappingURL=not.d.ts.map