declare namespace Force {
    /**
     * Creates and returns a pair of force functions that handle the
     * arguments as specified in the type parameter.
     * The first function is used to retain callback functions that
     * are triggered when the second function is invoked,
     */
    function create<TFormat extends (...args: any[]) => void = () => void>(): [((callback: TFormat) => void) & {
        off(callback: TFormat): void;
    }, (...data: Parameters<TFormat>) => void];
}
//# sourceMappingURL=force.d.ts.map