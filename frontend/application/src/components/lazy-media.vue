<template>
    <div>
        <div ref="figure" class="figure" :style="{paddingTop:cssRatio}" :class="[{'as-hero': asHero, 'is-cover': isCover, 'has-bgcolor': hasBgcolor && isLoaded}]">

        <video v-if="video" ref="video" :autoplay="isDelayedAutoplay" :loop="isDelayedAutoplay" :muted="isDelayedAutoplay" :playsinline="isDelayedAutoplay" :controls="hasControls"
                   class="container media" :class="[{'js-loaded': source, 'has-fixed-ratio': hasRatio, 'is-cover': isCover}, positionClass ? positionClass : '']"
                   :src="source" :preload="preload"
                   :title="metadata ? (metadata.title || metadata.caption || '') : ''"
                   :style="{maxWidth: maxWidth, maxHeight: maxHeight}"
                   :poster="poster">
            </video>

            <div v-else-if="picture && domSvg" class="container" :class="[{'js-loaded': isLoaded, 'has-fixed-ratio': hasRatio}, positionClass ? positionClass : 'is-center']">
                <div v-if="source"
                     v-html="domSvg"
                     class="media has-svg-icon"
                     :class="[{'is-scaled': scaled && !isCover && hasRatio}, positionClass ? positionClass : 'is-center']"
                     :title="metadata ? (metadata.title || metadata.caption || '') : ''"
                     :alt="metadata ? (metadata.description || metadata.caption || '') : alt"
                     :style="{width: width, height: height, maxWidth: maxWidth, maxHeight: maxHeight}">
                </div>
            </div>

            <picture v-else-if="picture && !domSvg" class="container" :class="[{'js-loaded': isLoaded, 'has-fixed-ratio': hasRatio}, positionClass ? positionClass : 'is-center']">
                <source v-if="picture.extension === 'gif'" :srcset="picture.link">
                <source v-else v-for="(set, query) in picture.sources" :media="query === 'all' ? query : `(max-width:${query})`" :srcset="set">
                <img v-if="source"
                     class="media"
                     :class="[{'is-cover': isCover, 'is-scaled': scaled && !isCover && hasRatio}, positionClass ? positionClass : 'is-center']"
                     :src="source"
                     :width="width"
                     :height="height"
                     :title="metadata ? (metadata.title || metadata.caption || '') : ''"
                     :alt="metadata ? (metadata.description || metadata.caption || '') : alt"
                     :style="{maxWidth: maxWidth, maxHeight: maxHeight}">
            </picture>
        </div>

        <slot v-if="!source"></slot>
    </div>
</template>

<script lang="ts" src="./scripts/lazy-media.ts"></script>
<style scoped src="../styles/styles-components/lazy-media.css"></style>
