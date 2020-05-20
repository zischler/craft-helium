<template>
    <div
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"

        @mousedown="touchStart"
        @mousemove="touchMove"
        @mouseup="touchEnd"
        @mouseleave="touchEnd"

        @click.capture="blockClick"
        @wheel="onWheel"
        @dragstart.prevent

        :class='{ "js-cursor-down": hasCursorDown }'
    ></div>
</template>

<script lang="ts" src="./scripts/swipe.ts"></script>
