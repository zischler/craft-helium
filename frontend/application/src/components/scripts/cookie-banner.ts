import {Vue} from "vue-class-component";
import {Prop} from "vue-property-decorator";
import BrowserStorage from "../../helpers/browser-storage";
import {Action, Getter, Mutation} from "vuex-class";

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

    @Action("openCookieBanner") openCookieBanner;
    @Action("closeCookieBanner") closeCookieBanner;
    @Action("openCookieSettings") openCookieSettings;
    @Action("closeCookieSettings") closeCookieSettings;

    @Mutation("setCookieConsentFunctional") setCookieConsentFunctional;
    @Mutation("setCookieConsentAnalytics") setCookieConsentAnalytics;
    @Mutation("setCookieConsentThirdparty") setCookieConsentThirdparty;

    @Getter("cookieNameFunctional") cookieNameFunctional;
    @Getter("cookieNameAnalytics") cookieNameAnalytics;
    @Getter("cookieNameThirdParty") cookieNameThirdParty;
    @Getter("cookieConsentFunctional") consentFunctional;
    @Getter("cookieConsentAnalytics") consentAnalytics;
    @Getter("cookieConsentThirdparty") consentThirdparty;
    @Getter("showCookieBanner") isShow;
    @Getter("showCookieSettings") isOpen;

    mounted() {
        this.consentFunctional = BrowserStorage.getBooleanCookie(this.cookieNameFunctional) || false;

        if(this.consentFunctional) {
            this.$nextTick(() => { this.initCookiesConsent(); });
        } else {
            this.openCookieBanner();
        }
    }

    initCookiesConsent() {
        BrowserStorage.setCookie(this.cookieNameFunctional, true, 365);

        if(this.analyticsCookies) {
            this.setCookieConsentAnalytics(BrowserStorage.getBooleanCookie(this.cookieNameAnalytics) || false);
        }
        if(this.thirdpartyCookies) {
            this.setCookieConsentThirdparty(BrowserStorage.getBooleanCookie(this.cookieNameThirdParty) || false);
        }

        this.closeCookieBanner();
    }

    setAllCookiesConsent() {
        BrowserStorage.setCookie(this.cookieNameFunctional, true, 365);

        if(this.analyticsCookies) {
            BrowserStorage.setCookie(this.cookieNameAnalytics, true, 365);
            this.setCookieConsentAnalytics(true);
        }
        if(this.thirdpartyCookies) {
            BrowserStorage.setCookie(this.cookieNameThirdParty, true, 365);
            this.setCookieConsentThirdparty(true);
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
}
