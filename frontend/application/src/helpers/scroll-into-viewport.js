/*! Scroll Into Viewport v1.3 */
let scrollIntoViewportAnimationId = 0;
export default function scrollIntoViewport(topMargin = 0, speed = 35, bezier = [0.23, 1, 0.32, 1]) {
    return async function (element) {
        const goTo = getTopPosition(element) - topMargin;
        return scrollTo(goTo);
    };
    async function scrollTo(goTo) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const scrollOffset = window.pageYOffset;
            const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            const windowHeight = window.innerHeight;
            const easing = bezierEasing(bezier[0], bezier[1], bezier[2] || 1 - bezier[0], bezier[3] || 1 - bezier[1]);
            let delta = goTo - scrollOffset;
            const duration = Math.abs(delta / (speed * 60) * 1000);
            let toGo = scrollOffset;
            const next = pageHeight - goTo;
            if (next < windowHeight) {
                delta = delta - (windowHeight - next);
            }
            window.cancelAnimationFrame(scrollIntoViewportAnimationId);
            if (delta !== 0) {
                scrollIntoViewportAnimationId = window.requestAnimationFrame(step);
                return;
            }
            return resolve(false);
            function step() {
                const delay = Date.now() - startTime;
                const easingVariation = easing(delay / duration);
                toGo =
                    easingVariation > 1
                        ? goTo
                        : Math.ceil(delta * easingVariation + scrollOffset);
                if (easingVariation < 1 && toGo !== goTo) {
                    window.scrollTo(0, toGo);
                    scrollIntoViewportAnimationId = window.requestAnimationFrame(step);
                    return;
                }
                window.scrollTo(0, goTo);
                return resolve(true);
            }
        });
    }
}
function getTopPosition(element, boundary = window) {
    let top = element.offsetTop;
    while ((element = element.offsetParent) !== null &&
        element !== boundary) {
        top += element.offsetTop;
    }
    return top;
}
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
function bezierEasing(mX1, mY1, mX2, mY2) {
    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error("bezier x values must be in [0, 1] range");
    }
    const sampleValues = new Float32Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; i += 1) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
    }
    return function BezierEasing(x) {
        if (mX1 === mY1 && mX2 === mY2) {
            return x;
        }
        if (x === 0) {
            return 0;
        }
        if (x === 1) {
            return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
    };
    function getTForX(aX) {
        const lastSample = kSplineTableSize - 1;
        let intervalStart = 0.0;
        let currentSample = 1;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; currentSample += 1) {
            intervalStart += kSampleStepSize;
        }
        currentSample -= 1;
        const dist = (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        else if (initialSlope === 0.0) {
            return guessForT;
        }
        else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
    }
}
function A(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
    return 3.0 * aA1;
}
function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}
function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}
function binarySubdivide(aX, aA, aB, mX1, mX2) {
    let currentX;
    let currentT;
    let i = 0;
    do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
            aB = currentT;
        }
        else {
            aA = currentT;
        }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION &&
        (i += 1) < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
}
function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
            return aGuessT;
        }
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
}
//# sourceMappingURL=scroll-into-viewport.js.map