<template>
    <div class="map-wrapper relative overflow-hidden w-full h-64 md:h-auto" :class="{'js-initialized':isInitialized && !showCookieMessage}">
        <div ref="map" class="absolute top-0 left-0 w-full h-full"></div>
        <p v-if="showCookieMessage" class="o-editorial relative z-10">
            <span v-html="cookiemsgSpecific"></span><br>
            <span v-html="cookiemsgStart"></span> <a ref="link" @click="openCookieSettings()" v-html="cookiemsgLink"></a> <span v-html="cookiemsgEnd"></span>
        </p>
        <p hidden v-html="info" v-if="info"></p>
    </div>
</template>

<style scoped src="../styles/styles-components/google-map.css"></style>
<script lang="ts" src="./scripts/google-map.ts"></script>
