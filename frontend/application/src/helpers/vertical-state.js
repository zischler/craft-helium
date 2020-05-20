export default function verticalState(marginTop = 0, marginBottom = marginTop) {
    return function (domElement, container = window) {
        const wTop = container === window || container == undefined
            ? window.pageYOffset
            : container.scrollTop;
        const wHeight = container === window || container == undefined
            ? window.innerHeight
            : container.offsetHeight;
        const topPosition = getTopPosition(domElement);
        const topProgress = getTopProgress();
        const bottomProgress = getBottomProgress();
        return {
            topPosition,
            topProgress,
            bottomProgress,
            ahead: topProgress < 0,
            entering: topProgress > 0 && topProgress < 1 && bottomProgress < 0,
            contained: (topProgress < 1 && bottomProgress > 0) ||
                (topProgress > 1 && bottomProgress < 0),
            exiting: topProgress > 1 && bottomProgress > 0 && bottomProgress < 1,
            behind: bottomProgress > 1,
        };
        function getTopProgress() {
            return (1 -
                (topPosition - (wTop + marginTop)) /
                    (wHeight - marginTop - marginBottom));
        }
        function getBottomProgress() {
            return (1 -
                (topPosition + domElement.offsetHeight - (wTop + marginTop)) /
                    (wHeight - marginTop - marginBottom));
        }
    };
}
function getTopPosition(element, boundary = window) {
    let top = element.offsetTop;
    while ((element = element.offsetParent) !== null &&
        element !== boundary) {
        top += element.offsetTop;
    }
    return top;
}
//# sourceMappingURL=vertical-state.js.map