import {Vue, prop} from "vue-class-component";
import BrowserStorage from "../../helpers/browser-storage";
import {Action, Getter, Mutation} from "vuex-class";

class Props {
    bannerText = prop<string>({
        default: 'By continuing your visit to this site, you accept the use of cookies to make visits statistics.',
        required: false,
    });
    readMore = prop<string>({
        default: '',
        required: false,
    });
    readMoreLabel = prop<string>({
        default: 'Read More',
        required: false,
    });
    settingsLabel = prop<string>({
        default: 'Cookie Settings',
        required: false,
    });
    acceptLabel = prop<string>({
        default: 'Accept',
        required: false,
    });
    confirmLabel = prop<string>({
        default: 'Confirm',
        required: false,
    });
    backLabel = prop<string>({
        default: 'Back',
        required: false,
    });
    settingsExplanations = prop<string>({
        default: 'Define the cookies you want to allow.',
        required: false,
    });
    functionalLabel = prop<string>({
        default: 'Functional Cookies',
        required: false,
    });
    analyticsCookies = prop<boolean>({
        default: false,
        required: false,
    });
    analyticsLabel = prop<string>({
        default: 'Analytics Cookies',
        required: false,
    });
    thirdpartyCookies = prop<boolean>({
        default: false,
        required: false,
    });
    thirdpartyLabel = prop<string>({
        default: 'Thirdparty Cookies',
        required: false,
    });
}

export default class CookieBanner extends Vue.with(Props) {
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
