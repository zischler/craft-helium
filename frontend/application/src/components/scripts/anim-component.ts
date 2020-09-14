import {mixins, props} from "vue-class-component";
import verticalState, { VerticalState } from "../../helpers/vertical-state";

const Props = props({
    hasImage: {
        type: Boolean,
        default: false,
        required: false,
    },
    animName: {
        type: String,
        default: 'fade-in-top',
        required: false,
    },
})

export default class AnimComponent extends mixins(Props) {
    loadedImage: boolean = !this.hasImage;
    animate: boolean = false;
    topProgress: number = 0;

    mounted () {
        const component: HTMLElement = (this.$el) as HTMLElement;
        this.checkViewPort(component);
    }

    checkViewPort(component: HTMLElement) {
        const VState: VerticalState = verticalState(0,0)(component);
        this.topProgress = VState.topProgress;
        if(this.topProgress > 0.1 && this.loadedImage) {
            this.animate = true;
        } else {
            setTimeout(() => this.checkViewPort(component), 100);
        }
    }
}
