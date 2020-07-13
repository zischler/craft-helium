<template>
    <div class="o-google-map" :class="{'js-initialized':isInitialized && !showCookieMessage}">
        <div ref="map" class="map"></div>
        <div v-if="showCookieMessage" class="o-editorial" style="position: relative; z-index: 1;">
            <span v-html="cookiemsgSpecific"></span><br>
            <span v-html="cookiemsgStart"></span> <a ref="link" @click="openCookieSettings()" v-html="cookiemsgLink"></a> <span v-html="cookiemsgEnd"></span>
        </div>
        <p hidden v-html="info" v-if="info"></p>
    </div>
</template>

<style scoped src="../styles/styles-components/google-map.css"></style>
<script lang="ts" src="./scripts/google-map.ts"></script>
