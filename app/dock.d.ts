declare namespace Dock {
    /** */
    function cover(edge?: string | number): {
        position: string;
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    /** */
    function coverFixed(edge?: string | number): {
        position: string;
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    /** */
    function topLeft(x?: string | number, y?: string | number): {
        position: string;
        top: string;
        left: string;
    };
    /** */
    function topLeftFixed(x?: string | number, y?: string | number): {
        position: string;
        top: string;
        left: string;
    };
    /** */
    function topRight(x?: string | number, y?: string | number): {
        position: string;
        top: string;
        right: string;
    };
    /** */
    function topRightFixed(x?: string | number, y?: string | number): {
        position: string;
        top: string;
        right: string;
    };
    /** */
    function bottomLeft(x?: string | number, y?: string | number): {
        position: string;
        bottom: string;
        left: string;
    };
    /** */
    function bottomLeftFixed(x?: string | number, y?: string | number): {
        position: string;
        bottom: string;
        left: string;
    };
    /** */
    function bottomRight(x?: string | number, y?: string | number): {
        position: string;
        bottom: string;
        right: string;
    };
    /** */
    function bottomRightFixed(x?: string | number, y?: string | number): {
        position: string;
        bottom: string;
        right: string;
    };
    /** */
    function top(edge?: string | number): {
        position: string;
        top: string;
        left: string;
        right: string;
    };
    /** */
    function topFixed(edge?: string | number): {
        position: string;
        top: string;
        left: string;
        right: string;
    };
    /** */
    function right(edge?: string | number): {
        position: string;
        top: string;
        right: string;
        bottom: string;
    };
    /** */
    function rightFixed(edge?: string | number): {
        position: string;
        top: string;
        right: string;
        bottom: string;
    };
    /** */
    function bottom(edge?: string | number): {
        position: string;
        left: string;
        bottom: string;
        right: string;
    };
    /** */
    function bottomFixed(edge?: string | number): {
        position: string;
        left: string;
        bottom: string;
        right: string;
    };
    /** */
    function left(edge?: string | number): {
        position: string;
        top: string;
        left: string;
        bottom: string;
    };
    /** */
    function leftFixed(edge?: string | number): {
        position: string;
        top: string;
        left: string;
        bottom: string;
    };
    /** */
    function center(width?: string | number, height?: string | number): {
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        position: string;
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    /** */
    function centerFixed(width?: string | number, height?: string | number): {
        position: string;
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    /** */
    function centerTop(width?: string | number, height?: string | number): {
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        position: string;
        top: string;
        left: string;
        right: string;
    };
    /** */
    function centerTopFixed(width?: string | number, height?: string | number): {
        position: string;
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        top: string;
        left: string;
        right: string;
    };
    /** */
    function centerRight(width?: string | number, height?: string | number): {
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        position: string;
        top: string;
        right: string;
        bottom: string;
    };
    /** */
    function centerRightFixed(width?: string | number, height?: string | number): {
        position: string;
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        top: string;
        right: string;
        bottom: string;
    };
    /** */
    function centerBottom(width?: string | number, height?: string | number): {
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        position: string;
        left: string;
        bottom: string;
        right: string;
    };
    /** */
    function centerBottomFixed(width?: string | number, height?: string | number): {
        position: string;
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        left: string;
        bottom: string;
        right: string;
    };
    /** */
    function centerLeft(width?: string | number, height?: string | number): {
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        position: string;
        top: string;
        left: string;
        bottom: string;
    };
    /** */
    function centerLeftFixed(width?: string | number, height?: string | number): {
        position: string;
        margin: "auto";
        width?: string | undefined;
        height?: string | undefined;
        top: string;
        left: string;
        bottom: string;
    };
}
//# sourceMappingURL=dock.d.ts.map