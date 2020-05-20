<template>
    <div class="o-google-map" :class="{'js-initialized':isInitialized && !showCookieMessage}">
        <div ref="map" class="map"></div>
        <div v-if="showCookieMessage" style="position: relative; z-index: 1;">
            <span v-html="cookiemsgSpecific"></span><br>
            <span v-html="cookiemsgStart"></span> <a ref="link" @click="openCookieSettings()" v-html="cookiemsgLink"></a><span v-html="cookiemsgEnd"></span>
        </div>
        <p hidden v-html="info" v-if="info"></p>
    </div>
</template>

<style scoped>
    .o-google-map {
        position: relative;
        overflow: hidden;
        width: 100%;
    }

    .o-google-map.js-initialized {
        padding-top: 56.25%;
        opacity: 1;
        transition: opacity 0.25s linear 0.25s;
    }

    .o-google-map.js-loaded {
        opacity: 1;
    }

    .o-google-map > .map {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

<script lang="ts" src="./scripts/google-map.ts"></script>
