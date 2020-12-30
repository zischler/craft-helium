import BrowserStorage from "./browser-storage";

export default class TagManager {
    trackingAllowed = false;
    isBot = false;
    isProduction = false;

    init(isProduction) {
        this.isProduction = isProduction;
        this.isBot = /bot|googlebot|crawler|facebookexternalhit|spider|robot|crawling/i.test(navigator.userAgent);

        this.trackingAllowed = (!this.isBot && !this.doNotTrack());

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

            console.log("Tag Manager: At the moment no tracking code is set.")

            // TODO Enable Cookie banner in layout.twig and add google ID to script!

            //Google Analytics
            //const script = document.createElement('script');
            //script.innerHTML = `window.dataLayer = window.dataLayer || [];
            //                    function gtag(){dataLayer.push(arguments);}
            //                    gtag('js', new Date());
            //                    gtag('config', 'YOUR_GOOGLE_ID', {'anonymize_ip': true});`;
            // document.body.appendChild(script);
        } else {
            console.log("Tag Manager: Tracking not allowed because at least one of the following is true. is Author:" + !this.isProduction + ", do Not Track: " + this.doNotTrack() + ", isBot: "+this.isBot)
        }
    }

    destroy () {
        // Remove all component-specific Cookies
        console.log("Tag Manager: Remove all Google Analytics cookies");
        BrowserStorage.clearCookiesStartWith('_ga');
        BrowserStorage.clearCookiesStartWith('_gid');
    }

    doNotTrack() {
        const dnt = navigator.doNotTrack || window.doNotTrack;
        const canTrack = (dnt !== null && dnt !== undefined) ? (dnt && dnt !== 'yes' && dnt !== '1') : true;

        return !(canTrack);
    }
}
