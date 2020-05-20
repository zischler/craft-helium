import scrollIntoViewport from "../helpers/scroll-into-viewport";
const Scroll = {
    install(Vue, options) {
        Vue.directive("scroll", {
            inserted(el, binding) {
                const goto = document.querySelector(binding.value);
                if (!goto) {
                    return;
                }
                el.addEventListener("click", event => {
                    event.preventDefault();
                    options = options || {};
                    scrollIntoViewport(options.topMargin, options.speed, options.bezier)(goto).then((done) => {
                        if (done &&
                            typeof options.callback === "function") {
                            options.callback();
                        }
                    });
                });
            },
        });
    },
};
export default Scroll;
//# sourceMappingURL=vue-scroll.js.map