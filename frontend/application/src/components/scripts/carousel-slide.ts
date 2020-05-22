import {Component, Vue} from "vue-property-decorator";
import LazyMedia from "./lazy-media";

@Component
export default class CarouselSlide extends Vue {
    hasMedia: boolean = false;

    mounted() {
        let hasMedia = false;
        this.$children.find(child => {
            hasMedia = child.$options.name === "LazyMedia";
        });
        this.hasMedia = hasMedia;
    }

    getHeight(): number {
        if(this.hasMedia) {
            const calcHeightImg = this.getHeightOfQuery("img");
            const calcHeightVideo = this.getHeightOfQuery("video");

            let calcHeight = calcHeightImg > calcHeightVideo ? calcHeightImg : calcHeightVideo;
            // height if is isCover image
            if (calcHeight === 0) {
                this.$children.find(child => {
                    if(child.$options.name === "LazyMedia") {
                        const lazyMedia = child as LazyMedia;
                        const height = lazyMedia.naturalHeight;
                        const width = lazyMedia.naturalWidth;
                        calcHeight = this.$el.scrollWidth / (width / height);
                    }
                });
            }
            return calcHeight;
        } else {
            return this.$el.scrollHeight;
        }
    }

    getHeightOfQuery(query): number {
        const element = this.$el.querySelector(query);
        if (element) {
            return element.scrollHeight;
        }
        return 0;
    }
}
