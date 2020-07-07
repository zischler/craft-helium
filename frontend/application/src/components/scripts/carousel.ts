import {Vue, Component, Prop, Watch} from "vue-property-decorator";
import verticalState from "../../helpers/vertical-state";
import debounce from "lodash-es/debounce";
import Swipe from "./swipe";
import CarouselSlide from "./carousel-slide";


/*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Definition:                                                     *
*                                                                 *
*  Carousel-Viewport__________________________________            *
* |  Slide__________________________________________ |   Slide____*
* | |              |              |               |  |   |        *
* | |              |              |               |  |   |        *
* | |              |              |               |  |   |        *
* | |    item      |    item      |    item       |  |   |        *
* | |              |              |               |  |   |        *
* | |              |              |               |  |   |        *
* | |______________|______________|_______________|  |   |________*
* |__________________________________________________|            *
*                                                                 *
* If itemsPerSlide > 1 -> the .slide element becomes an item but  *
* keeps the slide class. The Slide however, becomes an abstract   *
* concept where multiple items (.slides) form one Slide.          *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*/


/*
* Slider: When all slides scroll together (one block is moved)
* Slideshow: When each slide is moved separately
* */
enum RenderType {
    Slider = "slider",
    Slideshow = "slideshow",
}

enum Orientation {
    Horizontal = "horizontal",
    Vertical = "vertical",
}

@Component
export default class Carousel extends Vue {
    @Prop({ type: Boolean, default: false })
    asHero!: boolean; // calculate height from top position, at render

    @Prop({ type: Boolean, default: false })
    autoplay!: boolean; // play automatically

    @Prop({ type: Number, default: 0 })
    columns!: number; // number of columns, overwrite minWidth

    @Prop({ type: Number, default: 5000 })
    delay!: number; // time to show a slide

    @Prop({
        type: Number,
        default: 0,
        validator(value: number) {
            return value >= 0;
        },
    })
    maxWidth!: number; // items maximum width

    @Prop({
        type: Number,
        default: 0,
        validator(value: number) {
            return value >= 0;
        },
    })
    minWidth!: number; // items minimum width

    @Prop({ type: Number, default: 75 })
    slideRatio!: number;

    @Prop({ type: String, default: RenderType.Slideshow })
    renderType!: RenderType;

    @Prop({ type: String, default: Orientation.Horizontal })
    orientation!: Orientation;

    @Prop({ type: Number, default: 0 })
    startAt!: number; // first item to show

    @Prop({ type: Boolean, default: true })
    isInfinite!: boolean; // If slider is infinite

    @Prop({ type: Number, default: 350 })
    transitionDelay!: number; // duration of the transition animation

    // Variables
    carouselWidth = 0; // used to control the resize event
    currentItem = -1; // currently shown item, currently badly used
    currentSlide = 1; // currently shown slide
    decal = 0; // used to calculate slide start position depending on items per slide
    doDecal = true;
    itemsPerSlide = 1; // number of items per slide depending on min-width
    itemsQuantity = 0; // number of items
    itemWidth = 0; // items min width
    occurrence = 0; // number of changes. Used to detect "js-first"
    slidesQuantity = 1; // number of slides depending on min-width
    playIntervalID; // setInterval UID fot the animation
    carouselViewportHeight = 0;

    // State
    isLoaded = false;
    isAutoplay = this.autoplay;
    isReverse = false;
    isSingleSlide = false;
    isTwoSlides = false;
    isTransitioning = false;
    onFirstSlide = false;
    onLastSlide = false;
    isVisible = false;
    isPending = false;

    // Wheel State
    isWheelBlocked = false;

    // Content
    items?: HTMLCollection | any[];
    itemsContainer: Element | null = null;
    itemsContainerStyles = {
        width: "0px",
        height: "0px",
        transform: "",
    };


    // Swipe
    swipe = new Swipe();
    hasCursorDown = false;
    @Watch("swipe.hasCursorDown")
    onCursorChange() {
        this.hasCursorDown = !this.hasCursorDown;
    }

    created() {
        // block bounce scroll on ios
        /*
        const view = document.querySelector("#view");

        if (view && /ip(ad|op|hone)/i.exec(navigator.userAgent)) {
            view.addEventListener("touchmove", e => e.preventDefault());
        }
        */
    }

    mounted() {
        this.setupDOM();
        this.init();

        // Reset the Carousel after the resize
        /** @this Carousel */
        function resize(this: Carousel) {
            if (this.isLoaded) {
                this.isLoaded = false;
                this.init();
                this.carouselViewportHeight = 0;
                this.$nextTick(() => { this.calcCarouselViewportHeight() });
            }
        }

        window.addEventListener("resize", debounce(resize.bind(this), 300));

        // Pause if not visible in the viewport
        const observer = new IntersectionObserver(entries => {
            const carousel = entries[0];

            this.isVisible = carousel.isIntersecting;

            this.renewAutoplayInterval();
        });

        observer.observe(this.$el);
        window.requestAnimationFrame(() => { this.calcCarouselViewportHeight() });
    }

    get updateCarouselViewportHeight() {
        return this.carouselViewportHeight > 0
            ? "padding-top:" + this.carouselViewportHeight + "%"
            : "height:100%";
    }

    setupDOM() {
        this.itemsContainer = this.$el.querySelector(".slides");
        this.items =
            this.itemsContainer == undefined
                ? undefined
                : this.itemsContainer.children;
        this.itemsQuantity = this.items == undefined ? 0 : this.items.length;
        this.isTwoSlides = this.itemsQuantity === 2;
    }

    init() {
        if (this.asHero) {
            pageLoaded().then(() => {
                setHeroHeight(this.$el as HTMLElement);
            });
            (window as any).addEventListener("resize", () => {
                setHeroHeight(this.$el as HTMLElement);
            });
        }

        const carouselViewport = (this.$el.querySelector(".carousel-viewport") || this.$el) as HTMLDivElement;
        this.carouselWidth = carouselViewport.offsetWidth;

        if (this.carouselWidth <= 0) {
            this.isLoaded = true;
            return;
        }

        const getWidth = (n: number) =>
            Math.min(
                this.columns > 0
                    ? this.carouselWidth / this.columns
                    : n || this.carouselWidth,
                this.carouselWidth,
            );

        this.itemsPerSlide = Math.max(
            Math.floor(this.carouselWidth / getWidth(this.minWidth)),
            Math.ceil(this.carouselWidth / getWidth(this.maxWidth)),
        );
        this.slidesQuantity = Math.ceil(this.itemsQuantity / this.itemsPerSlide);
        this.itemWidth = this.carouselWidth / this.itemsPerSlide;

        this.onFirstSlide = false;
        this.onLastSlide = false;
        this.isSingleSlide = false;

        this.updateSlidesHeight();

        this.setItemStyles();

        // Set class if it is a single slide Carousel
        this.isSingleSlide = this.slidesQuantity === 1;
        this.decal = 100;
        this.isLoaded = true;
        this.gotoSlide(
            Math.floor((this.currentItem < 0 ? this.startAt : this.currentItem) / this.itemsPerSlide)
        );
        this.isReverse = false;
    }

    updateSlidesHeight() {
        this.itemsContainerStyles.width =
            this.orientation === Orientation.Horizontal
                ? `${this.slidesQuantity * 100}%`
                : "100%";

        this.itemsContainerStyles.height =
            this.orientation === Orientation.Vertical
                ? `${this.slidesQuantity * 100}%`
                : "100%";
    }

    calcCarouselViewportHeight() {
        if (!this.asHero && this.renderType !== RenderType.Slider) {
            // Calculate Slideshow Height
            let maxSlideHeight = 0;
            let minSlideHeight = 1000;
            if (this.$children) {
                for (const _item of this.$children) {
                    const item = _item as CarouselSlide;
                    const calcHeight = item.calcHeight();

                    // Take biggest image (in height) that is not isCover. If all are isCover take the smallest one.
                    if (calcHeight > maxSlideHeight) {
                        maxSlideHeight = calcHeight;
                    } else if (calcHeight < minSlideHeight) {
                        minSlideHeight = calcHeight;
                    }
                }
            }

            if (maxSlideHeight !== 0) {
                this.carouselViewportHeight = maxSlideHeight / this.carouselWidth * 100;
            } else {
                this.carouselViewportHeight = minSlideHeight / this.carouselWidth * 100;
            }
        } else if (!this.asHero && this.renderType === RenderType.Slider) {
            // Calculate Slider Height
            let slidesPadding = 0;

            if (this.items && this.items.length > 0) {
                const slideStyle = this.items[0].currentStyle || window.getComputedStyle(this.items[0]);
                const slidePadding = parseFloat(slideStyle.paddingLeft) + parseFloat(slideStyle.paddingRight);

                slidesPadding = slidePadding * this.itemsPerSlide;
            }

            const contentW = (this.carouselWidth - slidesPadding) / Math.min(this.itemsPerSlide, this.itemsQuantity);

            this.carouselViewportHeight = contentW * this.slideRatio / this.carouselWidth;
        }
        this.updateSlidesHeight();
    }

    gotoSlide(slide: number) {
        if (this.renderType === RenderType.Slideshow) {
            const isReverse = slide < this.currentSlide;
            const slides = [slide];

            let cSlide = slide;
            if (isReverse) {
                while (this.currentSlide - 1 > cSlide) {
                    cSlide++;
                    slides.push(cSlide);
                }
            } else {
                while (this.currentSlide + 1 < cSlide) {
                    cSlide--;
                    slides.push(cSlide);
                }
            }
            for (let i = slides.length - 1; i >= 0; i--) {
                setTimeout(() => {
                    this.gotoSlideInternal(slides[i]);
                }, 400 * ((slides.length - i - 1)));
            }

        } else {
            this.gotoSlideInternal(slide);
        }
    }
    gotoSlideInternal(slide: number) {
        if (this.isTransitioning) {
            return;
        }

        // Reverse mode
        this.isReverse = slide < this.currentSlide;

        // Current slide in the possible range
        this.currentSlide = slide < 0
            ? this.slidesQuantity - 1
            : slide >= this.slidesQuantity
                ? 0
                : slide;

        // Do we show the last slide?
        const lastSlide = this.currentSlide >=
            this.slidesQuantity - (this.itemWidth === 0 ? 0 : 1) &&
            this.itemsQuantity % this.itemsPerSlide !== 0;

        // Calculate the last slide decal depending on how many least item do we have. Sometimes there are less than itemsPerSlide
        this.decal = lastSlide
            ? 100 / this.itemsPerSlide * (this.itemsQuantity % this.itemsPerSlide)
            : this.currentSlide === 0
                ? 100
                : this.decal;
        this.doDecal = lastSlide
            ? true
            : this.currentSlide === 0
                ? false
                : this.doDecal;

        // Move the slide
        this.currentItem = this.currentSlide * this.itemsPerSlide;

        // Move the slider
        if (this.renderType === RenderType.Slider) {
            this.isTransitioning = true;

            const move = -((this.currentSlide - 1) * 100 + this.decal);

            this.currentItem = this.currentSlide * this.itemsPerSlide - (this.doDecal ? this.itemsQuantity % this.itemsPerSlide : 0);
            this.itemsContainerStyles.transform =
                this.orientation === Orientation.Horizontal
                    ? `translateX(${
                        this.slidesQuantity > 1
                            ? move / this.slidesQuantity
                            : 0
                    }%)`
                    : `translateY(${
                        this.slidesQuantity > 1
                            ? move / this.slidesQuantity
                            : 0
                    }%)`;
            this.isTransitioning = false;
        }

        // Slide Style
        this.onFirstSlide = this.currentSlide <= 0;
        this.onLastSlide = this.slidesQuantity === 1 || this.currentSlide >= this.slidesQuantity - (this.itemWidth === 0 ? 0 : 1);

        // Set current active item, independent from visible elements
        if (this.items != undefined) {
            // Add Transition classes for two slides animation
            if (this.isTwoSlides) {
                this.isPending = true;

                const timer = setInterval((_this) => {
                   if (_this.$el.classList.contains("js-pending") && !this.isTransitioning) {
                       const item = _this.items[_this.currentItem];
                       if (_this.isReverse) {
                           if (item.classList.contains("js-next")) {
                               item.classList.remove("js-next");
                               item.classList.add("js-previous");
                           }
                       } else {
                           if (item.classList.contains("js-previous")) {
                               item.classList.remove("js-previous");
                               item.classList.add("js-next");
                           }
                       }

                       _this.$nextTick(async () => {
                           const timer2 = setInterval((__this) => {
                               __this.isPending = false;
                               __this.isTransitioning = true;
                               __this.handleClasses();
                               __this.renewAutoplayInterval();
                               clearInterval(timer2);
                            }, 400, _this);
                       });
                       clearInterval(timer);
                   }
                }, 20, this);
            } else {
                this.isTransitioning = true;
                this.handleClasses();
                this.renewAutoplayInterval();
            }
        }
    }


    handleClasses() {
        if (this.items) {
            for (let i = 0; i < this.itemsQuantity; i++) {
                const item = this.items[i];

                if (i >= this.currentItem && i < this.currentItem + this.itemsPerSlide) {
                    if (item.classList.contains("js-active")) {
                        // Already there, so no transition at all
                        this.isTransitioning = false;
                    } else {
                        item.classList.remove("js-previous");
                        item.classList.remove("js-next");
                        item.classList.add("js-active");

                        setTimeout(() => {
                            this.isTransitioning = false;
                        }, this.transitionDelay);
                    }
                } else if (item.classList.contains("js-active")) {
                    if (this.isReverse) {
                        item.classList.add("js-next");
                    } else {
                        item.classList.add("js-previous");
                    }
                    item.classList.remove("js-active");
                } else if (i === this.currentItem + 1 || this.onLastSlide && i === 0) {
                    item.classList.remove("js-previous");
                    item.classList.add("js-next");
                } else if (this.onFirstSlide && i === this.itemsQuantity - 1 || i === this.currentItem - 1) {
                    item.classList.remove("js-next");
                    item.classList.add("js-previous");
                } else {
                    item.classList.remove("js-previous");
                    item.classList.remove("js-next");
                }
            }

            // Set "js-first" class
            this.occurrence += 1;
            if (this.occurrence < 2) {
                for (let i = 0; i < this.itemsQuantity; i += 1) {
                    const item = this.items[i];

                    if (i >= this.currentItem && i < this.currentItem + this.itemsPerSlide) {
                        item.classList.add("js-first");
                        setTimeout(() => {
                            item.classList.remove("js-first");
                            this.isTransitioning = false;
                        }, this.transitionDelay);
                    }
                }
            }
        }
    }

    nextSlide(event: MouseEvent | Touch) {
        if (!(this.onLastSlide && !this.isInfinite) && !this.isPending) {
            const slide = event instanceof MouseEvent
                ? this.currentSlide + 1
                : this.currentSlide + (this.currentSlide < this.slidesQuantity - 1 ? 1 : 0);

            this.gotoSlide(slide);
        }
    }

    previousSlide(event: MouseEvent | Touch) {
        if (!(this.onFirstSlide && !this.isInfinite) && !this.isPending) {
            const slide = event instanceof MouseEvent
                ? this.currentSlide - 1
                : this.currentSlide - (this.currentSlide > 0 ? 1 : 0);

            this.gotoSlide(slide);
        }
    }

    /* --- Swipe --- */
    blockClick(event: MouseEvent) {
        this.swipe.blockClick(event);
    }

    touchStart(event: MouseEvent | Touch) {
        this.swipe.touchStart(event);
    }

    touchMove(event: MouseEvent | Touch) {
        this.swipe.touchMove(event);
    }

    touchEnd(event: MouseEvent | Touch) {
        this.swipe.hasCursorDown = false;
        const swipeMove = this.swipe.swipe;

        if (swipeMove.move) {
            const endEvent = this.getTouchEvent(event);
            const now = Date.now();
            const detail = {
                x: endEvent.clientX - swipeMove.x,
                y: endEvent.clientY - swipeMove.y,
            };

            // Horizontal swipe
            if (this.orientation === Orientation.Horizontal) {
                if (Math.abs(endEvent.clientY - swipeMove.y) < 30 && now - swipeMove.time < 1000) {
                    if (detail.x > 30) {
                        // swipe left
                        this.isAutoplay = false;
                        this.previousSlide(event);
                    } else if (detail.x < -30) {
                        // swipe right
                        this.isAutoplay = false;
                        this.nextSlide(event);
                    }
                }
            }

            // Vertical Swipe
            if (this.orientation === Orientation.Vertical) {
                if (Math.abs(endEvent.clientX - swipeMove.x) < 30 && now - swipeMove.time < 1000) {
                    if (detail.y > 30) {
                        // swipe down
                        this.previousSlide(event);
                    } else if (detail.y < -30) {
                        // swipe up
                        this.nextSlide(event);
                    }
                }
            }

            this.swipe.swipe.move = false;
        }
    }

    onWheel(event: WheelEvent) {
        // Vertical Swipe
        if (this.orientation === Orientation.Vertical) {
            event.preventDefault();
            if (!this.isTransitioning && !this.isWheelBlocked) {
                if (event.deltaY && event.deltaY > 3) {
                    this.blockWheel();
                    // swipe up
                    this.nextSlide(event);
                } else if (event.deltaY && event.deltaY < -3) {
                    this.blockWheel();
                    // swipe down
                    this.previousSlide(event);
                }
            }
        }
    }

    /* Block Wheel to not get multiple inputs from one slide */
    blockWheel() {
        this.isWheelBlocked = true;
        setTimeout(() => this.isWheelBlocked = false, this.transitionDelay);
    }

    setItemStyles() {
        if (this.items) {
            for (let i = 0; i < this.itemsQuantity; ) {
                for (let j = 0; j < this.itemsPerSlide && i < this.itemsQuantity; j += 1) {
                    const item = this.items[i];

                    if (!(item instanceof HTMLElement) && !("styles" in item)) { item.styles = {}; }

                    const itemStyles: HTMLElement["style"] = item instanceof HTMLElement ? item.style : item.styles;

                    itemStyles.flex = "0 1 auto";
                    const slideWidthSlider = ( Math.ceil(100 / ((this.slidesQuantity > 1 ? this.itemsPerSlide : this.itemsQuantity) * this.slidesQuantity) * 100 ) / 100 ) + "%";
                    itemStyles.width = this.orientation === Orientation.Horizontal
                            ? slideWidthSlider
                            : "100%";
                    itemStyles.left = "";
                    itemStyles.height = this.orientation === Orientation.Horizontal
                            ? "100%"
                            : slideWidthSlider;

                    i += 1;
                }
            }
        }
    }

    renewAutoplayInterval() {
        clearInterval(this.playIntervalID);
        if (this.isAutoplay && this.isVisible) {
            if (this.slidesQuantity > 1 && this.delay > 0) {
                this.playIntervalID = setInterval(
                    this.nextSlide.bind(this, new MouseEvent("void")),
                    this.delay,
                );
            }
        }
    }

    getTouchEvent(event: MouseEvent | Touch) {
        return "TouchEvent" in window && event instanceof TouchEvent
            ? event.changedTouches[0]
            : event;
    }
}

function setHeroHeight(element: HTMLElement) {
    const carouselTop = verticalState()(element).topPosition;

    element.style.height = `${window.innerHeight - carouselTop}px`;
}

async function pageLoaded() {
    return new Promise(resolve => {
        if (document.readyState === "complete") {
            resolve();
        } else {
            window.addEventListener("load", () => {
                resolve();
            });
        }
    });
}
