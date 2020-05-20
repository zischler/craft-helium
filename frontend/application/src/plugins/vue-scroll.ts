import { PluginObject } from "vue";
import scrollIntoViewport from "../helpers/scroll-into-viewport";

interface Scroll {
    speed?: number;
    topMargin?: number;
    bezier?: number[];
    callback?: Function;
}

/**
 * Create a new v-scroll directive
 * Take the value as CSS selector and create a click event to the current DOM Node
 * On click, will scroll to the declared Element
 * @example <div v-scroll="'#anId .aClass'">go to</div>
 * @type {PluginObject<Scroll>}
 */
const Scroll: PluginObject<Scroll> = {
    install(Vue, options) {
        Vue.directive("scroll", {
            inserted(el: HTMLElement, binding: any) {
                const goto = document.querySelector(binding.value);

                if (!goto) {
                    return;
                }

                el.addEventListener("click", event => {
                    event.preventDefault();
                    options = options || {};

                    scrollIntoViewport(
                        options.topMargin,
                        options.speed,
                        options.bezier,
                    )(goto).then((done: boolean) => {
                        if (
                            done &&
                            typeof (options as any).callback === "function"
                        ) {
                            (options as any).callback();
                        }
                    });
                });
            },
        });
    },
};

export default Scroll;
