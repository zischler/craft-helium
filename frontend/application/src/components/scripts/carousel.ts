import {Vue, prop } from "vue-class-component";
import verticalState from "../../helpers/vertical-state";
import debounce from "lodash-es/debounce";
import {isMobile, isTablet} from "../../helpers/page-state-checker";
import {Action, Getter, Mutation} from "vuex-class";
import {CarouselMetadata} from "../../models/CarouselMetadata";


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

class Props {
    asHero = prop<boolean>({ // calculate height from top position, at render
        default: false,
    });
    autoplay = prop<boolean>({ // play automatically
        default: false,
    });
    columns = prop<number>({ // number of columns, overwrite minWidth
        default: 0,
    });
    delay = prop<number>({ // time to show a slide
        default: 5000,
    });
    maxWidth = prop<number>({ // items maximum width
        default: 0,
        validator(value: number) {
            return value >= 0;
        },
    });
    minWidth = prop<number>({ // items minimum width
        default: 0,
        validator(value: number) {
            return value >= 0;
        },
    });
    slideRatio = prop<number>({
        default: -1,
    });
    renderType = prop<string>({
        default: RenderType.Slideshow,
    });
    orientation = prop<string>({
        default: Orientation.Horizontal,
    });
    startAt = prop<number>({ // first item to show
        default: 0,
    });
    isInfinite = prop<boolean>({ // If slider is infinite
        default: true,
    });
    transitionDelay = prop<number>({ // duration of the transition animation
        default: 350,
    });
    /* If Slide Width should be changed to allow multiple slides
    * being visible at the same time.
    * This is different than columns because here we want to
    * have navigation to each slide.
    */
    slideWidthPercentageDesktop = prop<number>({
        default: 100,
    });
    wheelEnabled = prop<boolean>({ // If Wheel usage changes slides
        default: false,
    });
}

export default class Carousel extends Vue.with(Props) {
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
    blockWheelTimer;
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
    hasCursorDown = false;

    // Carousel Vuex
    carouselId = "";
    @Getter("carousels") carousels;
    @Action("getCarouselHeight") getCarouselHeight;
    @Mutation("addCarousel") addCarousel;

    get slideWidthPercentage() {
        if(isMobile()) {
            if(this.slideWidthPercentageDesktop < 100) {
                return 80;
            } else {
                return 100;
            }
        } else if (isTablet()){
            if(this.slideWidthPercentageDesktop < 100) {
                return 40;
            } else {
                return 100;
            }
        } else {
            return this.slideWidthPercentageDesktop;
        }
    }

    created() {
        const carouselsSize = this.carousels.length;
        this.carouselId = "carousel-" + (carouselsSize+1);
        const carouselMetadata = {
            id: this.carouselId,
            height: 0,
        } as CarouselMetadata;
        this.addCarousel(carouselMetadata);
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
                ? `${this.slidesQuantity * this.slideWidthPercentage}%`
                : "100%";

        this.itemsContainerStyles.height =
            this.orientation === Orientation.Vertical
                ? `${this.slidesQuantity * this.slideWidthPercentage}%`
                : "100%";
    }

    calcCarouselViewportHeight() {
        if(!this.asHero && this.slideRatio !== -1) {
            this.carouselViewportHeight = this.slideRatio;
        } else if (!this.asHero) {
            // Calculate Slideshow Height
            this.getCarouselHeight(this.carouselId).then(height => {
                if (height !== 0) {
                    this.carouselViewportHeight = height / this.carouselWidth * 100;
                } else {
                    this.carouselViewportHeight = 1000 / this.carouselWidth * 100;
                }
            });
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
    swipeLeft(event) {
        this.handleSwipe(event, Orientation.Horizontal, true);
    }

    swipeRight(event) {
        this.handleSwipe(event, Orientation.Horizontal, false);
    }

    swipeUp(event) {
        this.handleSwipe(event, Orientation.Vertical, true);
    }

    swipeDown(event) {
        this.handleSwipe(event, Orientation.Vertical, false);
    }

    handleSwipe(event, necessaryOrientation, toNextSlide) {
        if (this.orientation === necessaryOrientation) {
            this.isAutoplay = false;
            toNextSlide ? this.nextSlide(event) : this.previousSlide(event);
        }
    }

    wheelUp(event) {
        if (this.wheelEnabled && !this.isTransitioning && !this.isWheelBlocked) {
            this.blockWheel();
            // swipe up
            this.nextSlide(event);
        }
    }

    wheelDown(event) {
        if (this.wheelEnabled && !this.isTransitioning && !this.isWheelBlocked) {
            this.blockWheel();
            // swipe up
            this.previousSlide(event);
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

    /* Get inner height of window because of iOS Safari bottom navigation */
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
