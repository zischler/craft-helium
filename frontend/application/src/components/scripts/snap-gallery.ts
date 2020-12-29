import {Vue, prop} from "vue-class-component";
import "scroll-behavior-polyfill";

class Props {
    projectTitle = prop<string>({
        default: '',
        required: false,
    });
    projectDescription = prop<string>({
        default: '',
        required: false,
    });
}

export default class SnapGallery extends Vue.with(Props) {
    images: NodeListOf<HTMLImageElement> = {} as any;
    groupBlock = {} as any;
    mask = {} as any;
    prevArrow = {} as any;
    carouselPositions = [] as any;
    middlePosition = 0;
    currentItem = 0;
    minIndex = 1;
    maxIndex = 0;
    currentItemLeftPos = 0;
    maxX = 0;
    reachedX = 0;
    showPrev = false;
    showNext = false;
    activeArrows = false;

    mounted() {
        this.images = (this.$refs.stripe as HTMLElement).querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        this.groupBlock = (this.$refs.group as HTMLElement) as HTMLElement;
        this.mask = (this.$refs.mask as HTMLElement) as HTMLElement;
        this.prevArrow = (this.$refs.prevArrow as HTMLElement) as HTMLElement;


        this.images.forEach((img)=> {
            let dataSrc:string = (img as HTMLImageElement).dataset.src || "";
            if(dataSrc) {
                (img as HTMLImageElement).setAttribute("src", dataSrc);
                (img as HTMLElement).removeAttribute("width");
                (img as HTMLElement).removeAttribute("height");
            }
        });

        setTimeout(()=> {


            this.maxIndex = this.images.length - 1;

            this.showPrev = this.currentItem !== this.minIndex;
            this.showNext = this.currentItem !== this.maxIndex;

            this.setCarouselPositions();

            (window as any).addEventListener("load",()=> {
                this.setCarouselPositions();
            });
            (window as any).addEventListener("resize",()=> {
                this.setCarouselPositions();
            });

            document.addEventListener("touchend",()=> {
                setTimeout(()=> { this.setCarouselPositions() },1000);
            });

            let tmt;
            this.getCurrentPosition();
            (this.$refs.stripe as HTMLElement).addEventListener("scroll",()=> {
                clearTimeout(tmt);
                tmt = setTimeout(()=>{
                    this.getCurrentPosition();
                },500);
            });
        }, 200);

    }

    getCurrentPosition() {

        const currentScrollLeft = (this.$refs.stripe as HTMLElement).scrollLeft + this.middlePosition;
        this.currentItem = 0;
        for (let i = 0; i < this.carouselPositions.length; i++) {
            if (currentScrollLeft >= this.carouselPositions[i][0] && currentScrollLeft <= this.carouselPositions[i][1]) {
                this.currentItem = i;
            }
        }

        this.reachedX = (this.$refs.stripe as HTMLElement).scrollLeft + (this.$refs.stripe as HTMLElement).offsetWidth;
        this.showPrev = this.currentItem !== this.minIndex && (this.$refs.stripe as HTMLElement).scrollLeft !== 0;
        this.showNext = this.currentItem !== this.maxIndex && this.reachedX < this.maxX - 20;
    }

    setPlaceholder(){
        const vw = (window as any).innerWidth;
        const groupW = (this.$refs.group as HTMLElement).offsetWidth;

        const maskW = window.innerWidth > 767 ? 30 : 15;
        this.mask.style.width = maskW + "px";
        let placeholderW = ( vw - groupW ) / 2;
        placeholderW = placeholderW < 15 ? 15 : placeholderW;
        this.images[0].style.width = placeholderW + "px";
    }

    setCarouselPositions() {
        this.setPlaceholder();

        this.carouselPositions = [];
        this.images.forEach((img)=> {
            let imageMiddle = img.offsetLeft + img.offsetWidth / 2;
            this.carouselPositions.push([img.offsetLeft, img.offsetLeft + img.offsetWidth, imageMiddle, img.offsetWidth]);
        });

        this.maxX = this.carouselPositions[this.maxIndex][1];
        this.middlePosition = (this.$refs.stripe as HTMLElement).offsetWidth/2;
        this.activeArrows = this.maxX  >(window as any).innerWidth;
        this.getCurrentPosition();
    }

    swipe(direction) {

        if (direction === 'previous') {
            if(this.currentItem - 1 < this.minIndex) {
                this.currentItem = this.minIndex;
            }
            else {
                this.currentItem = this.currentItem - 1;
            }
        }
        else {
            if(this.currentItem + 1 > this.maxIndex) {
                this.currentItem = this.maxIndex;
            }
            else {
                this.currentItem = this.currentItem + 1;
            }
        }

        if(this.carouselPositions[this.currentItem]){
            this.currentItemLeftPos = (this.carouselPositions[this.currentItem][0] + (this.carouselPositions[this.currentItem][1] - this.carouselPositions[this.currentItem][0]) / 2) - this.middlePosition;
            (this.$refs.stripe as HTMLElement).scrollTo({
                left: this.currentItemLeftPos,
                behavior: 'smooth'
            });
        }

        setTimeout(this.getCurrentPosition,1000);
    }

    checkClasses(direction) {

        return {
            'js-show': ( direction === 'prev' && this.showPrev ) || ( direction === 'next' && this.showNext),
            'js-active': this.activeArrows
        }
    }
}
