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
        window.requestAnimationFrame(() => {
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
        });
    }

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
        return calcHeight;
    }

    calcHeightOfQuery(query): number {
        const element = this.$el.querySelector(query);
        if (element) {
            return element.scrollHeight;
        }
        return 0;
    }
}
