import {CarouselMetadata} from "../../models/CarouselMetadata";

/*
*  Save metadata for all carousels for communication
*  between carousel and carousel slides. Used for
*  calculating height of slider.
*/

const state = {
    carousels: [] as CarouselMetadata[],
};

const getters = {
    carousels: state => state.carousels,
};

const actions = {
    getCarouselHeight: ({}, carouselId) => {
        const currentCarousel = state.carousels.find((carousel)=> {
            return carousel.id === carouselId;
        });

        if(currentCarousel) {
            return currentCarousel.height;
        } else {
            return 0;
        }
    },
};

const mutations = {
    increaseCarouselHeight: (state, newCarousel) => {
        const carousels = state.carousels;
        const currentCarousel = carousels.find(carousel => {
            return carousel.id === newCarousel.id;
        });
        if(currentCarousel.height < newCarousel.height) {
            currentCarousel.height = newCarousel.height;
        }
    },
    addCarousel: (state, carousel) => {
        state.carousels.push(carousel);
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};
