import {Vue, prop} from "vue-class-component";
import verticalState from "../../helpers/vertical-state";
import {Media} from "../../models/Media";
import {MediaRatio} from "../../models/MediaRatio";

class Props {
    mediaObject = prop<Object>({
        default: {},
    });
    asHero = prop<boolean>({ // calculate height from top position, at render
        default: false,
    });
    isInstantly = prop<boolean>({
        default: false,
    });
    isCover = prop<boolean>({
        default: false,
    });
    hasRatio = prop<boolean>({
        default: false,
    });
    cssRatio = prop<string>({
        default: 'unset',
    });
    isAutoplay = prop<boolean>({
        default: false,
    });
    positionClass = prop<string>({
        default: 'is-center',
    });
    ratio = prop<MediaRatio>({
        default: null,
    });
    scaled = prop<boolean>({
        default: false,
    });
    maxWidth = prop<string>({
        default: 'unset',
    });
    maxHeight = prop<string>({
        default: 'unset',
    });
    videoPoster = prop<string>({
        default: '',
    });
    titleAttribute = prop<string>({
        default: '',
    });
    naturalWidth = prop<number>({
        default: -1,
    });
    naturalHeight = prop<number>({
        default: -1,
    });
}


// Edge doesn't support object-fit for video...
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13603873/#comment-14
const IEdgeMatches = /(Edge|Trident)\/(\d.)/i.exec(navigator.userAgent);
const isOutdatedBrowser = IEdgeMatches !== null; // && parseInt(IEdgeMatches[2], 10) < 17;

export default class LazyMedia extends Vue.with(Props) {
    media: Media = {} as Media;
    source = "";
    width: string | number = this.naturalWidth;
    height: string | number = this.naturalHeight;
    title: string = "";
    poster: string = "";
    preload: string = "none";
    isImage: boolean = false;
    isLoaded0 = false;
    isDelayedAutoplay = false;
    hasControls = true;
    videoPlaying = false;
    onePageConcept = false;
    observer: IntersectionObserver | null = null;

    mounted() {
        this.init();
        window.addEventListener("load", this.update);
    }

    get isLoaded() {
        return this.source !== "" || this.isLoaded0;
    }

    set isLoaded(isLoaded: boolean) {
        this.isLoaded0 = isLoaded;
    }

    beforeUnmount() {
        this.source = "";
    }

    /**
     * @returns {Promise<void>}
     */
    async init(): Promise<void> {
        this.media = this.mediaObject as unknown as Media;
        this.isImage = this.media.kind === "image";

        if (this.asHero && this.isCover) {
            pageLoaded().then(() => {
                setHeroHeight(this.$el as HTMLElement);
            });
            (window as any).addEventListener("resize", () => {
                setHeroHeight(this.$el as HTMLElement);
            });
        }

        const source = this.isImage ? await getPictureSource(this.media.sources) : this.media.link;

        if (this.hasRatio && this.ratio && this.ratio.w && this.ratio.h && (this.$refs.figure as any)) {
            (this.$refs.figure as any).style.paddingTop =
                `calc(1 / (${this.ratio.w} / ${this.ratio.h}) * 100%)`;
        }

        if (this.media.kind === "video") {

            this.videoPlaying = false;

            this.isDelayedAutoplay = this.isAutoplay;
            this.poster = this.videoPoster ? this.videoPoster : "";
            this.preload = this.videoPoster ? "none" : "metadata";

            if (window.matchMedia('(max-device-width: 1024px)').matches && this.onePageConcept) {
                this.isDelayedAutoplay = false;
                this.hasControls = true;
            }

            if (window.matchMedia('(min-device-width: 1025px)').matches) {
                if (this.isAutoplay) {
                    this.hasControls = false;
                }
            }

            if (this.observer !== null) {
                this.observer.disconnect();
                this.observer = null;
            }

            if (window.matchMedia('(min-device-width: 1025px)').matches && this.onePageConcept) {
                this.isDelayedAutoplay = false;
            }

            this.source = source;

            if (window.matchMedia('(min-device-width: 1025px)').matches || !this.onePageConcept) {
                this.observer = new IntersectionObserver(
                    entries => {
                        if (!entries[0].isIntersecting) {
                            this.videoStop();
                            return;
                        }
                        this.videoPlay();
                    },
                    {},
                );

                if ((this.$refs.figure as any)) {
                    this.observer.observe((this.$refs.figure as any));
                }
            }
        } else if (this.isInstantly) {
            this.source = source;
        } else {
            this.source = "";

            if (this.observer !== null) {
                this.observer.disconnect();
                this.observer = null;
            }

            this.observer = new IntersectionObserver(
                entries => {
                    if (!entries[0].isIntersecting) {
                        return;
                    }

                    if (this.observer !== null) {
                        this.observer.disconnect();
                        this.observer = null;
                    }

                    this.source = source;
                },
            );

            if ((this.$refs.figure as any)) {
                this.observer.observe((this.$refs.figure as any));
            }
        }
    }

    update() {
        const image = (this.$refs.figure as any).querySelector("img");

        if (image) {
            // tslint:disable-next-line:no-bitwise

            this.imgLoaded(image);
        }

        const video = (this.$refs.figure as any).querySelector("video");

        if (video) {

            this.videoLoaded(video);
        }
    }

    videoPlay() {
        if (this.isAutoplay && !this.videoPlaying) {
            setTimeout(() => {
                const video = (this.$refs.figure as any).querySelector("video");
                if (video) {

                    this.isDelayedAutoplay = true;
                    video.removeAttribute("controls");
                    const videoPromise = video.play();

                    if (videoPromise !== undefined) {
                        videoPromise.then(_ => {
                            // Autoplay started!
                            this.videoPlaying = true;
                            video.removeAttribute("controls");
                            video.setAttribute("autoplay", true);
                        }).catch(error => {
                            console.log(error);
                            // Autoplay was prevented.
                            // Show a "Play" button so that user can start playback.
                            video.removeAttribute("controls");
                            video.setAttribute("autoplay", true);
                            setTimeout(() => {
                                this.videoPlay();
                            }, 1000);
                        });
                    }
                }
            }, 200);
        }
    }

    videoStop() {
        const video = (this.$refs.figure as any).querySelector("video");
        if (video) {
            video.pause();
            this.videoPlaying = false;
        }
    }

    videoLoaded(video) {

        if (
            typeof window.objectFitPolyfill === "function" &&
            isOutdatedBrowser &&
            this.isCover
        ) {
            window.objectFitPolyfill(video);
        }

        this.isLoaded = true;
    }

    async imgLoaded(image) {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        const source = image.getAttribute("src") || "";
        const ext = source.slice(((source.lastIndexOf(".") - 1) >>> 0) + 2);

        this.width = width;
        this.height = height;

        /*if (this.maxWidth !== "unset") {
            this.width = this.hasRatio ? "100%" : this.width;
            this.height = "auto";
        }
        if (this.maxHeight !== "unset") {
            this.width = "auto";
            this.height = this.hasRatio ? "100%" : this.height;
        }*/

        if (this.scaled) {
            const imageParent = image.parentElement;

            if (imageParent) {
                const imageRatio = width / height;
                const pictureWidth = imageParent.offsetWidth;
                const pictureHeight = imageParent.offsetHeight;
                const pictureArea = pictureWidth * pictureHeight;
                const pictureRatio = pictureWidth / pictureHeight;
                const area =
                    imageRatio >= pictureRatio
                        ? pictureWidth * height * (pictureWidth / width)
                        : pictureHeight * width * (pictureHeight / height);
                const areaRatio = area / pictureArea;
                const minScale = 0.4;
                const scale =
                    Math.round(
                        ((1 - areaRatio) * (1 - minScale) + minScale) *
                        100,
                    ) / 100;

                image.style.transform = `scale(${scale})`;
                image.style.transformOrigin = "center";
            }
        }

        // object-fit polyfill
        if (
            typeof window.objectFitPolyfill === "function" &&
            isOutdatedBrowser &&
            ext !== "svg" &&
            this.isCover
        ) {
            image.removeAttribute('style');
            window.objectFitPolyfill(image);
        }

        if (
            this.hasRatio &&
            typeof window.objectFitPolyfill === "function" &&
            isOutdatedBrowser &&
            ext !== "svg" &&
            !this.isCover
        ) {
            image.removeAttribute('style');
            image.setAttribute("data-object-fit", "contain");
            window.objectFitPolyfill(image);
        }
    }
}

async function getPictureSource(data: any): Promise<string> {

    const pixelRatio = window.devicePixelRatio || 1;
    const sourcesInfos: Array<{ pxr: number; src: string }> = [];
    let srcset: string = "";

    // Get the srcset that match the media query
    for (const key of Object.keys(data)) {
        const media = key === "all" ? key : `(max-width:${key})`;

        if (window.matchMedia(media).matches) {
            srcset = data[key];
            break;
        }
    }

    if (srcset === "") {
        throw new Error("no srcset found");
    }

    // Split the srcset between pixel ratio rules
    const sourceDefinitions = srcset.split(",");

    for (const definition of sourceDefinitions) {
        const def = definition.trim().replace(/\s{2,}/g, " ");
        const rules = def.split(" ");

        if (rules.length === 1) {
            // Pixel ratio 1
            sourcesInfos.push({
                pxr: 1,
                src: rules[0],
            });
        } else if (rules.length > 1) {
            // Other pixel ratios
            for (let i = 1, l = rules.length; i < l; i += 1) {
                if (rules[i].endsWith("x")) {
                    sourcesInfos.push({
                        pxr: Number(rules[i].slice(0, -1)),
                        src: rules[0],
                    });
                }
            }
        }
    }

    if (sourcesInfos.length > 0) {
        // Sort the pixel ratios
        sourcesInfos.sort((hash1: any, hash2: any) => {
            const pxr1 = hash1.pxr;
            const pxr2 = hash2.pxr;

            if (pxr1 < pxr2) {
                return -1;
            }
            if (pxr1 > pxr2) {
                return 1;
            }

            return 0;
        });

        // Extract the good version
        let validatedSource = sourcesInfos[sourcesInfos.length - 1].src;

        for (let i = 0, l = sourcesInfos.length; i < l; i += 1) {
            const source = sourcesInfos[i];

            validatedSource = source.src;
            if (source.pxr >= pixelRatio) {
                break;
            }
        }
        return validatedSource;
    }

    throw new Error("unable to define a source");
}

function setHeroHeight(element: HTMLElement) {
    const heroTop = verticalState()(element).topPosition;
    element.style.height = `${window.innerHeight - heroTop}px`;
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
