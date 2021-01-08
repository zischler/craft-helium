/* --- Application --- */
import { createApp } from 'vue';
import scrollIntoViewport from './helpers/scroll-into-viewport';
import {Section} from './models/Section';
import { store } from './store';

/* --- Styles --- */
import 'tailwindcss/tailwind.css';

/* --- Components --- */
import CookieBanner from './components/cookie-banner.vue';
import GoogleMap from './components/google-map.vue';
import CustomSelect from './components/custom-select.vue';
import SnapGallery from './components/snap-gallery.vue';
import AnimComponent from './components/anim-component.vue';
import LazyMedia from './components/lazy-media.vue';
import Carousel from './components/carousel.vue';
import CarouselSlide from './components/carousel-slide.vue';
import Swipe from "./components/swipe.vue";

// Create the vue instance
const app = createApp({
    data: () => ({
        isMounted: false,
        isMenuOpen: false,
        isMenuAnimate: false,
        isHomeNavigationHover: false,
        flyoutScrollbox: document.querySelector('#flyoutScrollbox') as HTMLElement,
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
        this.flyoutScrollbox = document.querySelector('#flyoutScrollbox') as HTMLElement;

        this.$store.commit('updateSectionAnchors');

        // Helpful for css revealing effects
        setTimeout(() => {
            this.isMounted = true;
            this.$store.commit('updateSectionPositions');

            if(((window as any).location as any).hash) {
                this.scrollTo(((window as any).location as any).hash);
            }
        },100);

        (window as any).addEventListener('resize',()=> {
            this.$store.commit('updateSectionPositions');
        });

        window.requestAnimationFrame(this.handleOnScroll);
    },
    methods: {
        toggleFlyout() {
            this.isMenuOpen = !this.isMenuOpen;

            if (this.isMenuOpen) {
                this.$store.dispatch('blockScroll', this.flyoutScrollbox);
            } else {
                this.$store.dispatch('clearScroll', this.flyoutScrollbox);
            }
        },
        scrollToTop() {
            scrollIntoViewport()(document.body);
        },
        scrollTo(elemSelector: string) {
            this.$store.dispatch('setBlockScrollWatch', true);
            const section = document.querySelector(elemSelector) as HTMLElement;
            clearTimeout((window as any).timout);
            (window as any).timout = setTimeout(()=> {
                this.$store.dispatch('setBlockScrollWatch', false);
                this.$store.dispatch('updateCurrentSection', section.getBoundingClientRect().top);
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
                    this.$store.dispatch('updateCurrentSection', this.navScrollPosition);
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
    beforeUnmount() {
        this.isMounted = false;
    }
});

/* --- Components --- */
// If a Vue (*.vue) component exists, import only it.
// The related CSS and TS are linked into the Vue component
app.component('cookie-banner', CookieBanner as any);
app.component('google-map', GoogleMap as any);
app.component('custom-select', CustomSelect as any);
app.component('snap-gallery', SnapGallery as any);
app.component('anim-component', AnimComponent as any);
app.component('lazy-media', LazyMedia as any);
app.component('multi-carousel', Carousel as any);
app.component('carousel-slide', CarouselSlide as any);
app.component('swipe', Swipe as any);

app.use(store);

// Connect the Vue instance to the whole <main id='view'> container
// Avoid to use the standard DOM API as a virtual-dom will handle it
app.mount('#view');
