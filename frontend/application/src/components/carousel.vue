<template>
    <div v-bind:data-render="renderType"
         v-bind:data-orientation="orientation"
         v-bind:class="{ 'js-loaded': isLoaded, 'js-first-slide': onFirstSlide, 'js-last-slide': onLastSlide, 'js-single-slide': isSingleSlide, 'js-reverse': isReverse,'infinite': isInfinite, 'js-transition': isTransitioning, 'js-two-slides': isTwoSlides, 'js-pending': isPending }">
        <div class="carousel-viewport"
             v-bind:style="updateCarouselViewportHeight"
             v-on:touchstart="touchStart"
             v-on:touchmove="touchMove"
             v-on:touchend="touchEnd"
             v-on:mousedown="touchStart"
             v-on:mousemove="touchMove"
             v-on:mouseup="touchEnd"
             v-on:mouseleave="touchEnd"
             v-on:click.capture="blockClick"
             v-on:wheel="onWheel"
             v-on:dragstart.prevent
             v-bind:class="{ 'js-cursor-down': hasCursorDown}">
            <div class="slides o-flex" v-bind:style="itemsContainerStyles">
                <slot name="slides"></slot>
            </div>
        </div>
        <div class="controls" v-if="slidesQuantity > 1">
            <div class="bullets">
            <template v-for="(_slide, index) in slidesQuantity">
                <button class="bullet" v-on:click="gotoSlide(index)" v-bind:class="{ 'js-active': (currentSlide === index) }">
                    <!--span class="is-visually-hidden">${i18n["carousel.show"]} {{ index + 1 }} ${i18n["carousel.showof"]} {{ slidesQuantity }}</span-->
                </button>
            </template>
            </div>
            <button v-on:click="previousSlide" class="previous-button" aria-label="Previous Slide" v-bind:disabled="isTransitioning || isPending">
                ❮
                <!--span class="is-visually-hidden">${i18n["carousel.previous"]}</span-->
            </button>
            <button v-on:click="nextSlide" class="next-button" aria-label="Next Slide" v-bind:disabled="isTransitioning || isPending">
                ❯
                <!--span class="is-visually-hidden">${i18n["carousel.next"]}</span-->
            </button>
        </div>
    </div>
</template>

<script lang="ts" src="./scripts/carousel.ts"></script>
<style scoped src="../styles/styles-components/carousel.css"></style>
