/*
*  Cookie and Cookie-Banner states
*/

import BrowserStorage from "../../helpers/browser-storage";

const state = {
    cookieNameFunctional: 'hasFunctionalConsent',
    cookieNameAnalytics: 'hasAnalyticsConsent',
    cookieNameThirdParty: 'hasThirdPartyConsent',
    cookieConsentFunctional: false,
    cookieConsentAnalytics: false,
    cookieConsentThirdparty: false,
    hasAnalyticsCookies: false,
    hasThirdpartyCookies: false,
    showCookieBanner: false,
    showCookieSettings: false,
};

const getters = {
    cookieNameFunctional: state => state.cookieNameFunctional,
    cookieNameAnalytics: state => state.cookieNameAnalytics,
    cookieNameThirdParty: state => state.cookieNameThirdParty,
    cookieConsentFunctional: state => state.cookieConsentFunctional,
    cookieConsentAnalytics: state => state.cookieConsentAnalytics,
    cookieConsentThirdparty: state => state.cookieConsentThirdparty,
    hasAnalyticsCookies: state => state.hasAnalyticsCookies,
    hasThirdpartyCookies: state => state.hasThirdpartyCookies,
    showCookieBanner: state => state.showCookieBanner,
    showCookieSettings: state => state.showCookieSettings,
};

const actions = {
    openCookieBanner: ({commit}) => {
        commit("setShowCookieBanner", true);
    },
    closeCookieBanner: ({commit}) => {
        commit("setShowCookieBanner", false);
    },
    openCookieSettings: ({commit}) => {
        if(state.hasAnalyticsCookies) {
            commit("setCookieConsentAnalytics", BrowserStorage.getBooleanCookie(state.cookieNameAnalytics) || false);
        }
        if(state.hasThirdpartyCookies) {
            commit("setCookieConsentThirdparty", BrowserStorage.getBooleanCookie(state.cookieNameThirdParty) || false);
        }

        commit("setShowCookieBanner", true);
        commit("setShowCookieSettings", true);
    },
    closeCookieSettings: ({commit}) => {
        commit("setShowCookieSettings", false);
    },
};

const mutations = {
    setShowCookieBanner: (state, showCookieBanner) => state.showCookieBanner = showCookieBanner,
    setShowCookieSettings: (state, showCookieSettings) => state.showCookieSettings = showCookieSettings,
    setCookieConsentFunctional: (state, cookieConsentFunctional) => state.cookieConsentFunctional = cookieConsentFunctional,
    setCookieConsentAnalytics: (state, cookieConsentAnalytics) => state.cookieConsentAnalytics = cookieConsentAnalytics,
    setCookieConsentThirdparty: (state, cookieConsentThirdparty) => state.cookieConsentThirdparty = cookieConsentThirdparty,
    setHasAnalyticsCookies: (state, hasAnalyticsCookies) => state.hasAnalyticsCookies = hasAnalyticsCookies,
    setHasThirdpartyCookies: (state, hasThirdpartyCookies) => state.hasThirdpartyCookies = hasThirdpartyCookies,
};

export default {
    state,
    getters,
    actions,
    mutations
};
