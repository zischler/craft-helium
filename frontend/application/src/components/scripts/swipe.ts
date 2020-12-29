import {Options, Vue} from "vue-class-component";

/**
 * Swipe Element
 * Don't forget to style it so that it takes the needed space
 * @example
 * <swipe @swipeup="doSomething()" class="o-swipe"></swipe>
 */
@Options({
    emits: ['swipeend', 'swipemove', 'swiperight', 'swipeleft', 'swipedown', 'swipeup']
})
export default class Swipe extends Vue {
    public blockClickEventDistance = 0;
    public swipe = {
        move: false,
        time: 0,
        x: 0,
        y: 0,
    };
    public hasCursorDown = false;

    /**
     * Block the click Event only if the pointer moves more than 30px
     * Let the pointer click through the swipe layer
     * @param {MouseEvent} event
     */
    public blockClick(event: MouseEvent) {
        if (this.blockClickEventDistance > 30) {
            event.preventDefault();
        } else {
            this.swipe.move = false;
            this.$emit("swipeend", { x: 0, y: 0 });
        }
    }

    /**
     * Pointer click/touch
     * @param {MouseEvent | Touch} event
     */
    public touchStart(event: MouseEvent | Touch) {
        const startEvent = this.getTouchEvent(event);

        this.swipe.x = startEvent.clientX;
        this.swipe.y = startEvent.clientY;
        this.swipe.time = Date.now();
        this.swipe.move = true;
        this.blockClickEventDistance = 0;
        this.hasCursorDown = true;
    }

    /**
     * Pointer is moving
     * @param {MouseEvent | Touch} event
     */
    public touchMove(event: MouseEvent | Touch) {
        if (this.swipe.move) {
            const moveEvent = this.getTouchEvent(event);
            const detail = {
                x: moveEvent.clientX - this.swipe.x,
                y: moveEvent.clientY - this.swipe.y,
            };

            // Bigger distance moved
            this.blockClickEventDistance = Math.max(
                Math.abs(detail.x),
                Math.abs(detail.y),
                this.blockClickEventDistance,
            );

            // Send how much the pointer moved horizontally and vertically
            this.$emit("swipemove", detail);
        }
    }

    /**
     * Pointer released
     * @param {MouseEvent | Touch} event
     */
    public touchEnd(event: MouseEvent | Touch) {
        this.hasCursorDown = false;

        // not a single click
        if (this.swipe.move) {
            const endEvent = this.getTouchEvent(event);
            const now = Date.now();
            const detail = {
                x: endEvent.clientX - this.swipe.x,
                y: endEvent.clientY - this.swipe.y,
            };

            // A horizontal swipe has to:
            //   - be done in less than 1 second
            //   - be moved more than 30 pixels horizontally
            //   - be moved less than 30 pixels vertically
            if (Math.abs(endEvent.clientY - this.swipe.y) < 30 && now - this.swipe.time < 1000) {
                if (detail.x > 30) {
                    this.$emit("swiperight");
                } else if (detail.x < -30) {
                    this.$emit("swipeleft");
                }
            }

            // A vertical swipe has to:
            //   - be done in less than 1 second
            //   - be moved more than 30 pixels vertically
            //   - be moved less than 30 pixels horizontally
            if (Math.abs(endEvent.clientX - this.swipe.x) < 30 && now - this.swipe.time < 1000) {
                if (detail.y > 30) {
                    this.$emit("swipedown");
                } else if (detail.y < -30) {
                    this.$emit("swipeup");
                }
            }

            // Emit the move event with the distance informations
            this.$emit("swipeend", detail);
            this.swipe.move = false;
        }
    }

    /**
     * Consider wheel mouse event as swipe up and down
     * @param {WheelEvent} event
     */
    public onWheel(event: WheelEvent) {
        if (event.deltaY > 0) {
            this.$emit("swipeup");
        } else if (event.deltaY < 0) {
            this.$emit("swipedown");
        }
    }

    public getTouchEvent(event: MouseEvent | Touch) {
        return "TouchEvent" in window && event instanceof TouchEvent
            ? event.changedTouches[0]
            : event;
    }
}
