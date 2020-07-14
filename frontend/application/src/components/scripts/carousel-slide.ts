import {Vue} from "vue-class-component";
import LazyMedia from "./lazy-media";

export default class CarouselSlide extends Vue {
    calcHeight(): number {
        const calcHeightImg = this.calcHeightOfQuery("img");
        const calcHeightVideo = this.calcHeightOfQuery("video");

        if(!calcHeightImg && !calcHeightVideo) {
            return this.$el.scrollHeight;
        } else {
            let calcHeight = calcHeightImg > calcHeightVideo ? calcHeightImg : calcHeightVideo;
            // height if is isCover image
            if (calcHeight === 0) {
                this.$children.forEach(child => {
                    if(child.$options.name === "LazyMedia") {
                        const lazyMedia = child as LazyMedia;
                        const height = lazyMedia.naturalHeight;
                        const width = lazyMedia.naturalWidth;
                        calcHeight = this.$el.scrollWidth / (width / height);
                    }
                });
            }
            return calcHeight;
        }
    }

    calcHeightOfQuery(query): number {
        const element = this.$el.querySelector(query);
        if (element) {
            return element.scrollHeight;
        }
        return 0;
    }
}
