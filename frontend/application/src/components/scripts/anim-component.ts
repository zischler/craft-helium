import {Component, Prop, Vue} from "vue-property-decorator";
import verticalState, { VerticalState } from "../../helpers/vertical-state";

@Component
export default class AnimComponent extends Vue {
    @Prop({type: Boolean, default: false})
    hasImage!: boolean;

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
