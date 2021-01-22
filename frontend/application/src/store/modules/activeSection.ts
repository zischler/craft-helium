import {Section} from "../../models/Section";
import {offset} from "../../helpers/scroll-state-helper";

/*
*  State of section where one is located at in the page.
*  Used for the section annotation.
*/

const state = {
    activeSectionId: "",
    activeSectionName: "",
    sectionAnchors: [] as Section[],
    blockScrollWatch: false,
};

const getters = {
    activeSectionName: state => state.activeSectionName,
    activeSectionId: state => state.activeSectionId,
    sectionAnchors: state => state.sectionAnchors,
    blockScrollWatch: state => state.blockScrollWatch,
};

const actions = {
    updateCurrentSection: ({commit}, currentPosition) => {
        let activeSection;
        state.sectionAnchors.forEach((section)=> {
            if(currentPosition > section.position) {
                activeSection = section;
            }
        });

        if(activeSection) {
            commit("setActiveSectionId", activeSection.id);
            commit("setActiveSectionName", activeSection.title);
        } else if(state.sectionAnchors[0] && state.activeSectionName === "") {
            commit("setActiveSectionName", state.sectionAnchors[0].title);
        }
    }
};

const mutations = {
    setActiveSectionId: (state, activeSectionId) => state.activeSectionId = activeSectionId,
    setBlockScrollWatch: (state, blockScrollWatch) => state.blockScrollWatch = blockScrollWatch,
    setActiveSectionName: (state, activeSectionName) => state.activeSectionName = activeSectionName,
    updateSectionAnchors: (state) => {
        const sections: Section[] = [];
        const htmlSections = document.querySelectorAll(".js-section-anchor") as NodeListOf<HTMLElement>;
        for(const htmlSection of htmlSections) {
            const section = {} as Section;
            section.id = htmlSection.id;
            section.title = htmlSection.textContent!;
            section.element = htmlSection;
            section.position = Math.floor(offset(section.element).top) - section.element.offsetHeight;
            sections.push(section);
        }
        state.sectionAnchors = sections;
    },
    updateSectionPositions: (state) => {
        const sections = [] as any;
        state.sectionAnchors.forEach((section)=> {
            section.position = Math.floor(offset(section.element).top) - section.element.offsetHeight;
            sections.push(section);
        });
        state.stateAnchors = sections;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};
