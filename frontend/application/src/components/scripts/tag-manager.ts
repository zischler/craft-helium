import {mixins, props} from "vue-class-component";
import BrowserStorage from "../../helpers/browser-storage";
import {Getter} from "vuex-class";

const Props = props({
    isProduction: {
        type: Boolean,
        default: true,
        required: false
    },
})
export default class CookieBanner extends mixins(Props) {
    @Getter("cookieConsentAnalytics") cookieConsentAnalytics;

    trackingAllowed = false;
    isBot = false;

    created() {
        this.isBot = /bot|googlebot|crawler|facebookexternalhit|spider|robot|crawling/i.test(navigator.userAgent);

        this.trackingAllowed = (!this.isBot && !this.doNotTrack());
    }

    mounted() {
        // TODO Check if still works
        if(this.isProduction) {
            this.launch();
        } else {
            this.destroy();
        }
    }

    /**
     * EVERY STATISTICS SCRIPTS COME HERE
     */

    launch() {
        if (this.isProduction && this.trackingAllowed) {
            /**
             * INSERT ALL TRACKING CODE HERE
             */

            console.log("At the moment no tracking code is set.")

            // TODO Enable Cookie banner in layout.twig !

            //Google Analytics
            //const script = document.createElement('script');
            //script.innerHTML = `window.dataLayer = window.dataLayer || [];
            //                    function gtag(){dataLayer.push(arguments);}
            //                    gtag('js', new Date());
            //                    gtag('config', 'YOUR_GOOGLE_ID', {'anonymize_ip': true});`;
            // document.body.appendChild(script);
        } else {
            console.log("Tracking not allowed because at least one of the following is true. is Author:" + !this.isProduction + ", do Not Track: " + this.doNotTrack() + ", isBot: "+this.isBot)
        }
    }

    destroy () {
        // Remove all component-specific Cookies
        console.log("Remove all Google Analytics cookies");
        BrowserStorage.clearCookiesStartWith('_ga');
        BrowserStorage.clearCookiesStartWith('_gid');
    }

    doNotTrack() {
        const dnt = navigator.doNotTrack || window.doNotTrack;
        const canTrack = (dnt !== null && dnt !== undefined) ? (dnt && dnt !== 'yes' && dnt !== '1') : true;

        return !(canTrack);
    }
}
