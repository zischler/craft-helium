<template>
    <div>
        <div ref="figure" class="figure" :style="{paddingTop:cssRatio}" :class="[{'as-hero': asHero, 'is-cover': isCover}]">

            <video v-if="!isImage" ref="video" :autoplay="isDelayedAutoplay" :loop="isDelayedAutoplay" :muted="isDelayedAutoplay" :playsinline="isDelayedAutoplay" :controls="hasControls"
                   class="container media" :class="[{'js-loaded': source, 'has-fixed-ratio': hasRatio, 'is-cover': isCover}, positionClass ? positionClass : '']"
                   :src="source" :preload="preload"
                   :title="media.title || ''"
                   :style="{maxWidth: maxWidth, maxHeight: maxHeight}"
                   :poster="poster">
            </video>

            <picture v-else class="container" :class="[{'js-loaded': isLoaded, 'has-fixed-ratio': hasRatio}, positionClass ? positionClass : 'is-center']">
                <source v-if="media.extension === 'gif'" :srcset="media.link">
                <img v-if="source"
                     class="media"
                     :class="[{'is-cover': isCover, 'is-scaled': scaled && !isCover && hasRatio}, positionClass ? positionClass : 'is-center']"
                     :src="source"
                     :width="width"
                     :height="height"
                     :title="media.title || ''"
                     :alt="media.altText"
                     :style="{maxWidth: maxWidth, maxHeight: maxHeight}">
            </picture>
        </div>

        <slot v-if="!source"></slot>
    </div>
</template>

<script lang="ts" src="./scripts/lazy-media.ts"></script>