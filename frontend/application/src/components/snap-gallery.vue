<template>
    <div class="snap-gallery relative">
        <div class="o-section has-no-bottom-space has-no-top-space">
            <div ref="group" class="o-group has-no-bottom-space has-no-top-space">
                <div class="mb-8">
                    <h2>{{ projectTitle }}</h2>
                    <p>{{ projectDescription }}</p>
                </div>
            </div>
        </div>
        <div ref="stripe" class="stripe" @scroll="onStripeScroll">
            <div class="relative h-48 lg:h-80">
                <img class="placeholder" src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
            </div>
            <slot></slot>
        </div>
        <button ref="prevArrow" class="arrow prev is-left" @click="swipe('previous')" :class="checkClasses('prev')">
            <svg xmlns="http://www.w3.org/2000/svg" class="arrow-svg left" viewBox="0 0 35 48" preserveAspectRatio="xMidYMax" width="35px" height="48px">
                <path class="arrow-point" d="M4.5,24l18-17V41L4.5,24z"/>
                <path class="arrow-stroke" d="M30.5,9v30"/>
            </svg>
        </button>
        <button class="arrow next is-right" @click="swipe('next')" :class="checkClasses('next')">
            <svg xmlns="http://www.w3.org/2000/svg" class="arrow-svg right" viewBox="0 0 35 48" preserveAspectRatio="xMidYMax" width="35px" height="48px">
                <path class="arrow-point" d="M30.5,24l-18,17V7L30.5,24z"/>
                <path class="arrow-stroke" d="M4.5,39V9"/>
            </svg>
        </button>
    </div>
</template>

<script lang="ts" src="./scripts/snap-gallery.ts"></script>
<style scoped src="../styles/styles-components/snap-gallery.css"></style>