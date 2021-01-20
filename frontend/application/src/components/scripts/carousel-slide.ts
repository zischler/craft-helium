import {prop, Vue} from "vue-class-component";
import {Action, Mutation} from "vuex-class";
import {CarouselMetadata} from "../../models/CarouselMetadata";


class Props {
    carouselId = prop<string>({
        default: ""
    });
}

export default class CarouselSlide extends Vue.with(Props) {
    // Carousel Vuex
    @Mutation("increaseCarouselHeight") increaseCarouselHeight;
    @Action("getCarouselHeight") getCarouselHeight;

    mounted() {
        const height = this.calcHeight();
        const carouselMetadata = {
            id: this.carouselId,
            height
        } as CarouselMetadata;

        this.getCarouselHeight(this.carouselId).then(carouselHeight => {
            if(carouselHeight < height) {
                this.increaseCarouselHeight(carouselMetadata);
            }
        })
    }

    // TODO: Fix Calculation of image and video height.
    // Currently doesn't find some images and videos to get their height and width.
    // Maybe needs a requestAnimationFrame, which would then affect the carousel if added.
    calcHeight(): number {
        const calcHeightImg = this.calcHeightOfQuery("img");
        const calcHeightVideo = this.calcHeightOfQuery("video");
        let calcHeight = calcHeightImg >= calcHeightVideo ? calcHeightImg : calcHeightVideo;
        const mediaElement = calcHeightImg >= calcHeightVideo ? this.$el.querySelector("img") : this.$el.querySelector("video");
        if(!!mediaElement && this.$el.scrollWidth > 0) {
            const height = mediaElement.height;
            const width = mediaElement.width;
            calcHeight = this.$el.scrollWidth / (width / height);
        }
        return calcHeight === 0 ? this.$el.scrollWidth : calcHeight;
    }

    calcHeightOfQuery(query): number {
        const element = this.$el.querySelector(query);
        if (element) {
            return element.scrollHeight;
        }
        return 0;
    }

    /* TODO Remove me if not needed */
    findLazyMediaComponent() {

        return this.$el.querySelector("div[type.name=LazyMedia]");
        /*if(this.$slots) {
            const children = this.$slots.default();
            for(let child of children) {
                if(this.isLazyMediaComponent(child)) {
                    return child;
                }
            }
        }
        return null;*/
    }
}
