/* --- Application --- */
import Vue from "vue";
import VueScroll from "./plugins/vue-scroll";
import scrollIntoViewport from "./helpers/scroll-into-viewport";
import EventBus from "./helpers/eventbus";
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';

Vue.use(VueScroll);

// Create the vue instance
const vm = new Vue({
    data() {
        return {
            isMounted: false,
            isMenuOpen: false,
            isMenuAnimate: false,
            isHomeNavigationHover: false,
            flyoutScrollbox: document.querySelector("#flyoutScrollbox") as HTMLElement,
            sectionAnchors: document.querySelectorAll(".section-anchor") as NodeListOf<HTMLElement>,
            activeSectionId: "",
            doc: document.documentElement as HTMLElement,
            navScrollPosition: 0,
            blockScrollWatch: false,
            blockNavWatch: false,
            isNavHidden: false,
            sectionAnchorsPositions: [] as any
        }
    },
    mounted() {
        this.flyoutScrollbox = document.querySelector("#flyoutScrollbox") as HTMLElement;
        this.sectionAnchors = document.querySelectorAll(".section-anchor") as NodeListOf<HTMLElement>;

        // Helpful for css revealing effects
        setTimeout(() => {
            this.isMounted = true;
            this.setSectionPositions();

            if(((window as any).location as any).hash) {
                this.scrollTo(((window as any).location as any).hash);
            }
        },100);

        (window as any).addEventListener("resize",()=> {
            this.setSectionPositions();
        });

        window.requestAnimationFrame(this.handleOnScroll);


        const images = this.$el.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

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

        EventBus.$on('home-navigation-hover', this.handleHomeNavigationHover);

        EventBus.$on('cookieConsent', this.addGoogleAnalyticsScript);
    },
    methods: {
        toggleFlyout() {
            this.isMenuAnimate = true;
            setTimeout(()=> {
                this.isMenuAnimate = false;
            }, 750);

            this.isMenuOpen = !this.isMenuOpen;

            if (this.isMenuOpen) {
                this.isMenuAnimate = true;
                this.doc.classList.add("is-not-scrollable");
                disableBodyScroll(this.flyoutScrollbox);
            } else {
                this.doc.classList.remove("is-not-scrollable");
                enableBodyScroll(this.flyoutScrollbox);
            }
        },
        scrollToTop() {
            scrollIntoViewport()(document.body);
        },
        scrollTo(elemSelector: string) {
            this.blockScrollWatch = true;
            clearTimeout((window as any).timout);
            (window as any).timout = setTimeout(()=> { this.blockScrollWatch = false; } ,3000);

            if(this.isMenuOpen) {
                this.toggleFlyout();
            }

            this.activeSectionId = elemSelector.substring(1);
            const section = document.querySelector(elemSelector) as HTMLElement;
            scrollIntoViewport()(section);
        },
        scrollClose() {
            if(!this.blockScrollWatch && !this.isMenuOpen) {
                const currentScrollPosition = window.scrollY || window.pageYOffset;
                if (this.navScrollPosition <= 1) {
                    this.isNavHidden = false;
                } else if (this.navScrollPosition < currentScrollPosition) {
                    this.isNavHidden = true;
                } else if (this.navScrollPosition > currentScrollPosition) {
                    this.isNavHidden = false;
                }

                if(currentScrollPosition !== this.navScrollPosition) {
                    let activeSection = "";
                    this.sectionAnchorsPositions.forEach((section)=> {
                        if(this.navScrollPosition > section[1]){
                            activeSection = section[0];
                        }
                    });
                    this.activeSectionId = activeSection;
                }
                let activeSection = "";
                this.sectionAnchorsPositions.forEach((section)=> {
                    if(this.navScrollPosition > section[1]){
                        activeSection = section[0];
                    }
                });
                this.activeSectionId = activeSection;

                this.navScrollPosition = window.scrollY || window.pageYOffset;
            }
        },
        isWindow( obj ) {
            return obj !== null && obj === obj.window;
        },
        getWindow( elem ) {
            return this.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
        },
        offset( elem ) {
            let docElem;
            let win;
            let box = { top: 0, left: 0 };
            const doc = elem && elem.ownerDocument;

            docElem = doc.documentElement;

            if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
                box = elem.getBoundingClientRect();
            }
            win = this.getWindow( doc );
            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        },
        setSectionPositions() {
            this.sectionAnchorsPositions = [] as any;
            this.sectionAnchors.forEach((section)=> {
                const sectionId:String = (section as HTMLElement).id || "0";
                const sectionPos:Number = sectionId === "contact" ? Math.floor(this.offset(section).top) - (section as HTMLElement).offsetHeight - (window.innerHeight / 2) : Math.floor(this.offset(section).top) - (section as HTMLElement).offsetHeight;
                this.sectionAnchorsPositions.push([sectionId, sectionPos]);
            });
        },
        handleOnScroll() {
            this.scrollClose();
            window.requestAnimationFrame(this.handleOnScroll);
        },
        openCookieBanner() {
            EventBus.$emit('openCookieBanner',{});
        },
        checkScrollNavClasses(id){
            return {'js-active': id === this.activeSectionId };
        },
        handleHomeNavigationHover(child) {
            this.isHomeNavigationHover = child !== -1;
        },
        addGoogleAnalyticsScript(payload) {
            if(payload.hasAnalyticsConsent) {
                const script = document.createElement('script');
                script.innerHTML = `window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', 'UA-********-1', {'anonymize_ip': true});`;
                document.body.appendChild(script);
            }
        }
    },
});

/* --- Components --- */
// If a Vue (*.vue) component exists, import only it.
// The related CSS and TS are linked into the Vue component
Vue.component("cookie-banner", () => import('./components/cookie-banner.vue'));
Vue.component("tag-manager", () => import('./components/tag-manager.vue'));
Vue.component("google-map", () => import('./components/google-map.vue'));
Vue.component("custom-select", () => import('./components/customSelect.vue'));
Vue.component("toggle-field", () => import('./components/toggle-field.vue'));
Vue.component("snap-gallery", () => import('./components/snap-gallery.vue'));
Vue.component("anim-component", () => import('./components/scripts/anim-component'));
Vue.component("lazy-media", () => import('./components/lazy-media.vue'));
Vue.component("multi-carousel", () => import('./components/carousel.vue'));
Vue.component("carousel-slide", () => import('./components/scripts/carousel-slide'));

// Vue.config.errorHandler = function(err) { console.log("errorHandler", err) }

// Connect the Vue instance to the whole <main id="view"> container
// Avoid to use the standard DOM API as a virtual-dom will handle it
vm.$mount("#view");
