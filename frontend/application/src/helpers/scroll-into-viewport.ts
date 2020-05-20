/*! Scroll Into Viewport v1.3 */
// tslint:disable:no-conditional-assignment

let scrollIntoViewportAnimationId = 0;

/**
 * like element.scrollIntoView({block: "top", behavior: "smooth"});
 * @param {number} [topMargin=0] Top margin decal in pixel
 * @param {number} [speed=35] Average pixel per frame (~ 60fps)
 * @param {number[]} [bezier=[0.23, 1, 0.32, 1]]
 * @returns {function|number} the callback if any
 */
export default function scrollIntoViewport(
    topMargin: number = 0,
    speed: number = 35,
    bezier: number[] = [0.23, 1, 0.32, 1],
): Function {
    /**
     * @param {HTMLElement} element
     * @returns {Promise<boolean>} true: scrolled; false: already at destination
     */
    return async function(element: HTMLElement): Promise<{}> {
        const goTo = getTopPosition(element) - topMargin;

        return scrollTo(goTo);
    };

    /**
     * @param {number} goTo
     * @returns {Promise<boolean>}
     */
    async function scrollTo(goTo: number): Promise<{}> {
        return new Promise(resolve => {
            const startTime = Date.now();
            const scrollOffset = window.pageYOffset; // or pageYOffset=scrollY
            const pageHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
            );
            const windowHeight = window.innerHeight;

            /** @type {function(number): number} */
            const easing: (arg0: number) => number = bezierEasing(
                bezier[0],
                bezier[1],
                bezier[2] || 1 - bezier[0],
                bezier[3] || 1 - bezier[1],
            );

            let delta = goTo - scrollOffset;
            const duration = Math.abs(delta / (speed * 60) * 1000);
            let toGo = scrollOffset;

            // limit to not scroll more than the page can scroll
            // if the target position is low in the page
            const next = pageHeight - goTo;

            if (next < windowHeight) {
                delta = delta - (windowHeight - next);
            }

            window.cancelAnimationFrame(scrollIntoViewportAnimationId);

            if (delta !== 0) {
                scrollIntoViewportAnimationId = window.requestAnimationFrame(
                    step,
                );

                return;
            }

            // already at destination
            return resolve(false);

            /**
             * Scroll to the element
             * @returns {*}
             */
            function step(): any {
                // FIXME :: doesn't work well on mobile
                /*
                const whereAmI = window.pageYOffset;

                if (toGo < whereAmI - 1 || toGo > whereAmI + 1) {
                    // Scroll animation cancelled
                    // for high definition screens, some browsers doesn't return a integer if
                    // the screen's pixel's definition is not an integer.
                    return reject();
                }
                */

                const delay = Date.now() - startTime;
                const easingVariation = easing(delay / duration);

                toGo =
                    easingVariation > 1
                        ? goTo // if scroll too much
                        : Math.ceil(delta * easingVariation + scrollOffset);

                // Still need to scroll
                if (easingVariation < 1 && toGo !== goTo) {
                    window.scrollTo(0, toGo); // or scroll()
                    scrollIntoViewportAnimationId = window.requestAnimationFrame(
                        step,
                    );

                    return;
                }

                // Scroll done, perfectly placed
                window.scrollTo(0, goTo);

                return resolve(true);
            }
        });
    }
}

/**
 * Get top position of an element in the page
 * @param {HTMLElement} element
 * @param {Element|Window} [boundary=window]
 * @returns {number} the top position in pixels
 */
function getTopPosition(
    element: HTMLElement,
    boundary: Element | Window = window,
): number {
    let top = element.offsetTop;

    while (
        (element = element.offsetParent as HTMLElement) !== null &&
        element !== boundary
    ) {
        top += element.offsetTop;
    }

    return top;
}

/**
 * Based on BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 * @see https://github.com/gre/bezier-easing
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

/**
 *
 * @param {number} mX1
 * @param {number} mY1
 * @param {number} mX2
 * @param {number} mY2
 * @returns {function(number): number}
 */
function bezierEasing(
    mX1: number,
    mY1: number,
    mX2: number,
    mY2: number,
): (arg0: number) => number {
    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error("bezier x values must be in [0, 1] range");
    }

    // Precompute samples table
    const sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; i += 1) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
    }

    /**
     * @param {number} x
     * @returns {number}
     */
    return function BezierEasing(x) {
        if (mX1 === mY1 && mX2 === mY2) {
            return x; // linear
        }

        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0) {
            return 0;
        }

        if (x === 1) {
            return 1;
        }

        return calcBezier(getTForX(x), mY1, mY2);
    };

    /**
     *
     * @param {number} aX
     * @returns {number}
     */
    function getTForX(aX: number): number {
        const lastSample = kSplineTableSize - 1;
        let intervalStart = 0.0;
        let currentSample = 1;

        for (
            ;
            currentSample !== lastSample && sampleValues[currentSample] <= aX;
            currentSample += 1
        ) {
            intervalStart += kSampleStepSize;
        }

        currentSample -= 1;

        // Interpolate to provide an initial guess for t
        const dist =
            (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
            return guessForT;
        } else {
            return binarySubdivide(
                aX,
                intervalStart,
                intervalStart + kSampleStepSize,
                mX1,
                mX2,
            );
        }
    }
}

/**
 * @param {number} aA1
 * @param {number} aA2
 * @returns {number}
 */
function A(aA1: number, aA2: number): number {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}

/**
 * @param {number} aA1
 * @param {number} aA2
 * @returns {number}
 */
function B(aA1: number, aA2: number): number {
    return 3.0 * aA2 - 6.0 * aA1;
}

/**
 * @param {number} aA1
 * @returns {number}
 */
function C(aA1: number): number {
    return 3.0 * aA1;
}

/**
 * Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
 * @param {number} aT
 * @param {number} aA1
 * @param {number} aA2
 * @returns {number}
 */
function calcBezier(aT: number, aA1: number, aA2: number): number {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

/**
 * Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
 * @param {number} aT
 * @param {number} aA1
 * @param {number} aA2
 * @returns {number}
 */
function getSlope(aT: number, aA1: number, aA2: number): number {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

/**
 * @param {number} aX
 * @param {number} aA
 * @param {number} aB
 * @param {number} mX1
 * @param {number} mX2
 * @returns {number}
 */
function binarySubdivide(
    aX: number,
    aA: number,
    aB: number,
    mX1: number,
    mX2: number,
): number {
    let currentX;
    let currentT;
    let i = 0;

    do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;

        if (currentX > 0.0) {
            aB = currentT;
        } else {
            aA = currentT;
        }
    } while (
        Math.abs(currentX) > SUBDIVISION_PRECISION &&
        (i += 1) < SUBDIVISION_MAX_ITERATIONS
    );

    return currentT;
}

/**
 * @param {number} aX
 * @param {number} aGuessT
 * @param {number} mX1
 * @param {number} mX2
 * @returns {number}
 */
function newtonRaphsonIterate(
    aX: number,
    aGuessT: number,
    mX1: number,
    mX2: number,
): number {
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
