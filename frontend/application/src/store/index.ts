import Vuex from 'vuex';
import Vue from 'vue';
import ScrollLock from './modules/scrollLock';
import ActiveSection from './modules/activeSection';

// Load Vuex
Vue.use(Vuex);

// Create store
export default new Vuex.Store({
    modules: {
        ScrollLock,
        ActiveSection
    }
});
