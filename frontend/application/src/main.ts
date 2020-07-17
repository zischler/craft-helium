/* --- Application --- */
import { createApp } from "vue";
import scrollIntoViewport from "./helpers/scroll-into-viewport";
import {Section} from "./models/Section";
import store from './store';

// Create the vue instance
const vm = createApp({
    delimiters: ['${', '}'],
    data: () => ({
        isMounted: false,
        isMenuOpen: false,
        isMenuAnimate: false,
        isHomeNavigationHover: false,
        flyoutScrollbox: document.querySelector("#flyoutScrollbox") as HTMLElement,
        doc: document.documentElement as HTMLElement,
        navScrollPosition: 0,
        blockNavWatch: false,
        isNavHidden: false
    }),
    computed: {
        sectionAnchors(): Section[] {
            return this.$store.getters.sectionAnchors;
        },
        activeSectionName(): string {
            return this.$store.getters.activeSectionName;
        },
        blockScrollWatch(): string {
            return this.$store.getters.blockScrollWatch;
        },
        activeSectionId(): string {
            return this.$store.getters.activeSectionId;
        },
    },
    mounted() {
        this.flyoutScrollbox = document.querySelector("#flyoutScrollbox") as HTMLElement;

        this.$store.commit("updateSectionAnchors");

        // Helpful for css revealing effects
        setTimeout(() => {
            this.isMounted = true;
            this.$store.commit("updateSectionPositions");

            if(((window as any).location as any).hash) {
                this.scrollTo(((window as any).location as any).hash);
            }
        },100);

        (window as any).addEventListener("resize",()=> {
            this.$store.commit("updateSectionPositions");
        });

        window.requestAnimationFrame(this.handleOnScroll);

        const images = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

        images.forEach((img)=> {
            let dataSrc:string = (img as HTMLImageElement).dataset.src || "";
            if(dataSrc) {
                (img as HTMLImageElement).setAttribute("src", dataSrc);
                setTimeout(()=> {
                    (img as HTMLElement).removeAttribute("width");
                    (img as HTMLElement).removeAttribute("height");
                }, 200);
            }
        });
    },
    methods: {
        toggleFlyout() {
            this.isMenuOpen = !this.isMenuOpen;

            if (this.isMenuOpen) {
                this.$store.dispatch("blockScroll", this.flyoutScrollbox);
            } else {
                this.$store.dispatch("clearScroll", this.flyoutScrollbox);
            }
        },
        scrollToTop() {
            scrollIntoViewport()(document.body);
        },
        scrollTo(elemSelector: string) {
            this.$store.dispatch("setBlockScrollWatch", true);
            const section = document.querySelector(elemSelector) as HTMLElement;
            clearTimeout((window as any).timout);
            (window as any).timout = setTimeout(()=> {
                this.$store.dispatch("setBlockScrollWatch", false);
                this.$store.dispatch("updateCurrentSection", section.getBoundingClientRect().top);
            } ,3000);

            if(this.isMenuOpen) {
                this.toggleFlyout();
            }

            scrollIntoViewport()(section);
        },
        /* Handler after each scroll ending */
        scrollClose() {
            if(!this.blockScrollWatch && !this.isMenuOpen) {
                const currentScrollPosition = window.scrollY || window.pageYOffset;

                if(currentScrollPosition !== this.navScrollPosition) {
                    this.$store.dispatch("updateCurrentSection", this.navScrollPosition);
                }

                this.navScrollPosition = window.scrollY || window.pageYOffset;
            }
        },
        handleOnScroll() {
            this.scrollClose();
            window.requestAnimationFrame(this.handleOnScroll);
        },
        openCookieBanner() {
            this.$store.dispatch('openCookieBanner');
        }
    },
    beforeDestroy() {
        this.isMounted = false;
    }
});

vm.use(store);

/* --- Components --- */
// If a Vue (*.vue) component exists, import only it.
// The related CSS and TS are linked into the Vue component
vm.component("cookie-banner", () => import('./components/cookie-banner.vue'));
vm.component("tag-manager", () => import('./components/tag-manager.vue'));
vm.component("google-map", () => import('./components/google-map.vue'));
vm.component("custom-select", () => import('./components/customSelect.vue'));
vm.component("snap-gallery", () => import('./components/snap-gallery.vue'));
vm.component("anim-component", () => import('./components/scripts/anim-component'));
vm.component("lazy-media", () => import('./components/lazy-media.vue'));
vm.component("multi-carousel", () => import('./components/carousel.vue'));
vm.component("carousel-slide", () => import('./components/carousel-slide.vue'));

// Vue.config.errorHandler = function(err) { console.log("errorHandler", err) }

// Connect the Vue instance to the whole <main id="view"> container
// Avoid to use the standard DOM API as a virtual-dom will handle it
vm.mount("#view");
