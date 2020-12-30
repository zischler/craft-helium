<template>
    <div :data-render="renderType"
         :data-orientation="orientation"
         :class="{ 'js-loaded': isLoaded, 'js-first-slide': onFirstSlide, 'js-last-slide': onLastSlide, 'js-single-slide': isSingleSlide, 'js-reverse': isReverse,'infinite': isInfinite, 'js-transition': isTransitioning, 'js-two-slides': isTwoSlides, 'js-pending': isPending }">
        <swipe class="carousel-viewport"
               :style="updateCarouselViewportHeight"
                @swiperight="swipeRight"
                @swipeleft="swipeLeft"
                @swipeup="swipeUp"
                @swipedown="swipeDown"
                @wheeldown="wheelDown"
                @wheelup="wheelUp"
                >
            <template v-slot:content>
                <div class="slides o-flex" :style="itemsContainerStyles">
                    <slot name="slides"></slot>
                </div>
            </template>
        </swipe>
        <div class="controls" v-if="slidesQuantity > 1">
            <div class="bullets">
            <template v-for="index in slidesQuantity">
                <button class="bullet" v-on:click="gotoSlide(index)" :class="{ 'js-active': (currentSlide === index) }">
                    <!--span class="is-visually-hidden">${i18n["carousel.show"]} {{ index + 1 }} ${i18n["carousel.showof"]} {{ slidesQuantity }}</span-->
                </button>
            </template>
            </div>
            <button v-on:click="previousSlide" class="previous-button" aria-label="Previous Slide" :disabled="isTransitioning || isPending">
                ❮
                <!--span class="is-visually-hidden">${i18n["carousel.previous"]}</span-->
            </button>
            <button v-on:click="nextSlide" class="next-button" aria-label="Next Slide" :disabled="isTransitioning || isPending">
                ❯
                <!--span class="is-visually-hidden">${i18n["carousel.next"]}</span-->
            </button>
        </div>
    </div>
</template>

<script lang="ts" src="./scripts/carousel.ts"></script>
<style scoped src="../styles/styles-components/carousel.css"></style>