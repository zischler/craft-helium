import {createStore} from 'vuex';
import ScrollLock from './modules/scrollLock';
import ActiveSection from './modules/activeSection';
import CookieBanner from './modules/cookieBanner';

// Create store
export const store = createStore({
    modules: {
        ScrollLock,
        ActiveSection,
        CookieBanner
    }
});
