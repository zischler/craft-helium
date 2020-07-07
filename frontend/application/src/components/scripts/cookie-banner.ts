import {Component, Prop, Vue} from "vue-property-decorator";
import EventBus from "../../helpers/eventbus";
import BrowserStorage from "../../helpers/browser-storage";

@Component
export default class CookieBanner extends Vue {
    @Prop({type: String, default: 'By continuing your visit to this site, you accept the use of cookies to make visits statistics.'})
    bannerText!: string;

    @Prop({type: String, default: ''})
    readMore!: string;

    @Prop({type: String, default: 'Read More'})
    readMoreLabel!: string;

    @Prop({type: String, default: 'Cookie Settings'})
    settingsLabel!: string;

    @Prop({type: String, default: 'Accept'})
    acceptLabel!: string;

    @Prop({type: String, default: 'Confirm'})
    confirmLabel!: string;

    @Prop({type: String, default: 'Back'})
    backLabel!: string;

    @Prop({type: String, default: 'Define the cookies you want to allow.'})
    settingsExplanations!: string;

    @Prop({type: String, default: 'Functional Cookies'})
    functionalLabel!: string;

    @Prop({type: Boolean, default: false})
    analyticsCookies!: boolean;

    @Prop({type: String, default: 'Analytics Cookies'})
    analyticsLabel!: string;

    @Prop({type: Boolean, default: false})
    thirdpartyCookies!: boolean;

    @Prop({type: String, default: 'Thirdparty Cookies'})
    thirdpartyLabel!: string;

    cookieNameFunctional = 'hasFunctionalConsent';
    cookieNameAnalytics = 'hasAnalyticsConsent';
    cookieNameThirdParty = 'hasThirdPartyConsent';

    isShow = false;
    isOpen = false;

    consentFunctional = false;
    consentAnalytics = false;
    consentThirdparty = false;

    created() {
        EventBus.$on('openCookieBanner', () => {
            this.openCookieBanner();
        });

        EventBus.$on('openCookieSettings', () => {
            this.openCookieSettings();
        });

        EventBus.$on('closeCookieSettings', () => {
            this.closeCookieSettings();
        });
    }

    mounted() {
        this.consentFunctional = BrowserStorage.getBooleanCookie(this.cookieNameFunctional) || false;

        if(this.consentFunctional) {
            this.$nextTick(() => { this.initCookiesConsent(); });
        } else {
            this.emitEvents();
            this.isShow = true;
        }
    }

    emitEvents() {
        const payload = {};
        payload[this.cookieNameFunctional] = BrowserStorage.getBooleanCookie(this.cookieNameFunctional);

        if(this.analyticsCookies) {
            payload[this.cookieNameAnalytics] = BrowserStorage.getBooleanCookie(this.cookieNameAnalytics);
        }
        if(this.thirdpartyCookies) {
            payload[this.cookieNameThirdParty] = BrowserStorage.getBooleanCookie(this.cookieNameThirdParty);
        }

        EventBus.$emit('cookieConsent',payload);
    }

    initCookiesConsent() {

        BrowserStorage.setCookie(this.cookieNameFunctional, true, 365);

        if(this.analyticsCookies) {
            this.consentAnalytics = BrowserStorage.getBooleanCookie(this.cookieNameAnalytics) || false;
        }
        if(this.thirdpartyCookies) {
            this.consentThirdparty = BrowserStorage.getBooleanCookie(this.cookieNameThirdParty) || false;
        }

        this.closeCookieBanner();
    }

    setAllCookiesConsent() {

        BrowserStorage.setCookie(this.cookieNameFunctional, true, 365);

        if(this.analyticsCookies) {
            BrowserStorage.setCookie(this.cookieNameAnalytics, true, 365);
            this.consentAnalytics = true;
        }
        if(this.thirdpartyCookies) {
            BrowserStorage.setCookie(this.cookieNameThirdParty, true, 365);
            this.consentThirdparty = true;
        }

        this.closeCookieBanner();
    }

    confirmCookiesChoice() {

        BrowserStorage.setCookie(this.cookieNameFunctional, true, 365);

        if(this.analyticsCookies) {
            BrowserStorage.setCookie(this.cookieNameAnalytics, this.consentAnalytics, 365);
        }

        if(this.thirdpartyCookies) {
            BrowserStorage.setCookie(this.cookieNameThirdParty, this.consentThirdparty, 365);
        }

        this.closeCookieBanner();
    }

    openBanner() {
        EventBus.$emit('openCookieBanner',{});
    }

    openCookieBanner() {
        this.isShow = true;
    }

    closeCookieBanner() {
        this.isShow = false;
        this.emitEvents();
    }

    openSettings() {
        EventBus.$emit('openCookieSettings',{});
    }

    openCookieSettings() {
        if(this.analyticsCookies) {
            this.consentAnalytics = BrowserStorage.getBooleanCookie(this.cookieNameAnalytics) || false;
        }
        if(this.thirdpartyCookies) {
            this.consentThirdparty = BrowserStorage.getBooleanCookie(this.cookieNameThirdParty) || false;
        }
        this.isShow = true;
        this.isOpen = true;
    }

    closeSettings() {
        EventBus.$emit('closeCookieSettings',{});
    }

    closeCookieSettings() {
        this.isOpen = false;
    }
}
