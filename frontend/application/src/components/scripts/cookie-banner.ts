import {Vue, prop} from "vue-class-component";
import BrowserStorage from "../../helpers/browser-storage";
import {Action, Getter, Mutation} from "vuex-class";

class Props {
    bannerText = prop<string>({
        default: 'By continuing your visit to this site, you accept the use of cookies to make visits statistics.',
    });
    readMore = prop<string>({
        default: '',
    });
    readMoreLabel = prop<string>({
        default: 'Read More',
    });
    settingsLabel = prop<string>({
        default: 'Cookie Settings',
    });
    acceptLabel = prop<string>({
        default: 'Accept',
    });
    confirmLabel = prop<string>({
        default: 'Confirm',
    });
    backLabel = prop<string>({
        default: 'Back',
    });
    settingsExplanations = prop<string>({
        default: 'Define the cookies you want to allow.',
    });
    functionalLabel = prop<string>({
        default: 'Functional Cookies',
    });
    analyticsCookies = prop<boolean>({
        default: false,
    });
    analyticsLabel = prop<string>({
        default: 'Analytics Cookies',
    });
    thirdpartyCookies = prop<boolean>({
        default: false,
    });
    thirdpartyLabel = prop<string>({
        default: 'Thirdparty Cookies',
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
