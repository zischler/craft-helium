import {disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';

/*
*  State of the scroll lock.
*  When scroll is locked the user can't scroll.
*  This is used in overlays such as the navigation.
*/

const state = {
    doc: document.documentElement as HTMLElement,
    disabled: false,
};

const getters = {
};

const actions = {
    blockScroll({commit}, element) {
        if(!state.disabled) {
            state.doc.classList.add("is-not-scrollable");
            if(element) {
                disableBodyScroll(element);
                commit("setScrollDisabled", true);
            }
        }
    },
    enableScroll({commit}, element) {
        state.doc.classList.remove("is-not-scrollable");
        if(element) {
            enableBodyScroll(element);
            commit("setScrollDisabled", false);
        }
    },
    clearScroll({commit}) {
        state.doc.classList.remove("is-not-scrollable");
        clearAllBodyScrollLocks();
        commit("setScrollDisabled", false);
    }
};

const mutations = {
    setScrollDisabled: (state, disabled) => state.disabled = disabled,
};

export default {
    state,
    getters,
    actions,
    mutations
};
