import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import verticalState from "../../helpers/vertical-state";


// Edge doesn't support object-fit for video...
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13603873/#comment-14
const IEdgeMatches = /(Edge|Trident)\/(\d.)/i.exec(navigator.userAgent);
const isOutdatedBrowser = IEdgeMatches !== null; // && parseInt(IEdgeMatches[2], 10) < 17;

@Component
export default class LazyMedia extends Vue {

    @Prop({ type: String, default: "" })
    dataJson!: string;

    @Prop({ type: Boolean, default: false })
    asHero!: boolean; // calculate height from top position, at render

    @Prop({ type: Boolean, default: false })
    asSvg!: boolean;

    @Prop({ type: Boolean, default: false })
    isInstantly!: boolean;

    @Prop({ type: Boolean, default: false })
    isCover!: boolean;

    @Prop({ type: Boolean, default: false })
    hasRatio!: boolean;

    @Prop({ type: String, default: "unset" })
    cssRatio!: string;

    @Prop({ type: Boolean, default: false })
    hasCaption!: boolean;

    @Prop({ type: Boolean, default: false })
    isAutoplay!: boolean;

    @Prop({ type: String, default: "is-center" })
    positionClass!: string;

    @Prop({ type: Object, default: null })
    ratio!: any;

    @Prop({ type: Boolean, default: false })
    scaled!: boolean;

    @Prop({ type: String, default: "unset" })
    maxWidth!: string;

    @Prop({ type: String, default: "unset" })
    maxHeight!: string;

    @Prop({ type: String, default: "" })
    altAttribute!: string;

    @Prop({ type: String, default: "" })
    titleAttribute!: string;

    @Prop({ type: Number, default: -1 })
    maxRendition!: number;

    @Prop({ type: Number, default: -1 })
    naturalWidth!: number;

    @Prop({ type: Number, default: -1 })
    naturalHeight!: number;

    source = "";
    width: string | number = "100%";
    height: string | number = "100%";
    alt: string = "";
    title: string = "";
    poster: string = "";
    preload: string = "none";
    isLoaded = false;
    isDelayedAutoplay = false;
    hasControls = true;
    videoPlaying = false;
    onePageConcept = false;
    observer: IntersectionObserver | null = null;

    video: any = null;
    picture: any = null;
    domSvg: string = "";
    metadata: any = {};

    mounted() {
        this.init();
        window.addEventListener("load",this.update);
    }

    @Watch("dataJson")
    onDataJson() {
        this.init();
        if(this.observer){
            this.observer.disconnect();
            this.observer = null;
        }
        this.update();
    }

    beforeDestroy() {
        this.source = "";
    }
    /**
     * @returns {Promise<void>}
     */
    async init(): Promise<void> {

        if (this.asHero && this.isCover) {
            pageLoaded().then(() => {
                setHeroHeight(this.$el as HTMLElement);
            });
            (window as any).addEventListener("resize", () => {
                setHeroHeight(this.$el as HTMLElement);
            });
        }

        const data = this.dataJson ? JSON.parse(decodeURIComponent(this.dataJson)) : "";

        if (!data) {
            throw new Error("json is void");
        }

        this.video = data.video || null;
        this.picture = data.picture || null;
        this.metadata = data.metadata || null;

        if( this.metadata ){
            this.alt = this.metadata.description ? this.metadata.description : '';
        }

        if (this.maxRendition && this.maxRendition > 0 && this.picture) {
            this.picture.sources = restrictSources(
                this.picture.sources,
                this.maxRendition,
            );
        }

        let source = "";
        if( this.video  || this.picture ) {
            source = this.video ? this.video.link || "" : await getPictureSource(this.picture.sources);
        }

        if (this.hasRatio && this.ratio && this.ratio.w && this.ratio.h && (this.$refs.figure as any)) {
            (this.$refs.figure as any).style.paddingTop =
                `calc(1 / (${this.ratio.w} / ${this.ratio.h}) * 100%)`;
        }

        if (this.video) {

            this.videoPlaying = false;

            this.isDelayedAutoplay = this.isAutoplay;
            this.poster = this.video.poster ? this.video.poster : "";
            this.preload = this.video.poster ? "none" : "metadata";

            if(window.matchMedia('(max-device-width: 1024px)').matches && this.onePageConcept) {
                this.isDelayedAutoplay = false;
                this.hasControls = true;
            }

            if (window.matchMedia('(min-device-width: 1025px)').matches) {
                if(this.isAutoplay) {
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
                    {
                    },
                );

                if ((this.$refs.figure as any)) {
                    this.observer.observe((this.$refs.figure as any));
                }
            }
        }
        else if (this.isInstantly) {
            this.source = source;
        }
        else {
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

            if((this.$refs.figure as any)) {
                this.observer.observe((this.$refs.figure as any));
            }
        }

        this.isLoaded = true;
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

        this.isLoaded = true;
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
                            setTimeout(() => { this.videoPlay(); }, 1000);
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
        let width = image.naturalWidth;
        let height = image.naturalHeight;
        let svg;

        const source = image.getAttribute("src") || "";
        const ext = source.slice(((source.lastIndexOf(".") - 1) >>> 0) + 2);

        if (ext === "svg") {
            const parser = new DOMParser();
            const file = await fetch(this.source, {
                credentials: "include",
            });
            const fileAsText = await file.text();
            const fileAsSvg = parser.parseFromString(
                fileAsText,
                "image/svg+xml",
            );

            svg = fileAsSvg.getElementsByTagName("svg")[0] as SVGSVGElement;

            if (svg) {
                width =
                    svg.width.baseVal.value ||
                    svg.viewBox.baseVal.width;
                height =
                    svg.height.baseVal.value ||
                    svg.viewBox.baseVal.height;
            }
        }

        this.width = width;
        this.height = height;

        if (this.maxWidth !== "unset") {
            this.width = this.hasRatio ? "100%" : this.width;
            this.height = "auto";
        }
        if (this.maxHeight !== "unset") {
            this.width = "auto";
            this.height = this.hasRatio ? "100%" : this.height;
        }

        if (svg && this.asSvg) {
            svg.setAttribute("preserveAspectRatio", "xMidYMid");

            if(this.isCover) {
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");

                this.width = "100%";
                this.height = "100%";
            }
            else {
                let widthAttr = width.toString();
                let heightAttr = height.toString();

                if ( widthAttr.indexOf("%") === -1 ) {
                    if ( widthAttr.indexOf("px") === -1 ) { widthAttr = widthAttr + "px" }
                    svg.setAttribute("width", widthAttr);
                }
                else {
                    svg.setAttribute("width", "100%");
                }

                if ( heightAttr.indexOf("%") === -1 ) {
                    if ( heightAttr.indexOf("px") === -1 ) { heightAttr = heightAttr + "px" }
                    svg.setAttribute("height", "100%");
                } else {
                    svg.setAttribute("height", heightAttr);
                }

                this.width = widthAttr;
                this.height = heightAttr;
            }

            this.domSvg = svg.outerHTML || new XMLSerializer().serializeToString(svg);
        }

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
            image.setAttribute("data-object-fit","contain")
            window.objectFitPolyfill(image);
        }
    }
}

function getNumber(value: string | number): number | undefined {
    const result = /^(\d)+/.exec(value.toString());

    return result ? parseInt(result[0], 10) : undefined;
}

function restrictSources(data: any, max: number | string): any {
    const maxRendition = getNumber(max);

    if (maxRendition == undefined || maxRendition === 0) {
        return data;
    }

    const newSources: { [propName: string]: string } = {};
    const sourcesKeys = Object.keys(data);
    const sortedKeys = sourcesKeys.sort(
        (a: string, b: string): number => {
            const aNum = a === "all" ? Infinity : getNumber(a) || 0;
            const bNum = b === "all" ? Infinity : getNumber(b) || 0;

            return aNum <= bNum ? -1 : 1;
        },
    );

    for (const key of sortedKeys) {
        const keyNumber = getNumber(key) || Infinity;

        if (keyNumber <= maxRendition) {
            newSources[key] = data[key];
        } else {
            // tslint:disable-next-line:no-string-literal
            newSources["all"] = data[key];
            break;
        }
    }

    return newSources;
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
