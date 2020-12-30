<template>
    <div class="custom-select">
        <label v-if="label" :for="selectId" :class="{'js-open': isOpen}">
            {{label}} <dfn title="required" v-if="required">*</dfn>
        </label>
        <div class="select-input" v-on:click="openSelect()">
            <select
                ref="select"
                :class="{'hidden':isHidden}"
                :id="selectId"
                @focus="focusSelect()"
                @blur="blurSelect()"
                @change="changeSelect()"
                v-model="selectValue"
                :required="required">
                <option value="" :selected="{'selected': selectValue === defaultValue}" v-if="!required">{{ placeholder }}</option>
                <option v-for="option in this.dataObj" :value="option.value">{{ option.label }}</option>
            </select>
            <div class="select-placeholder" :class="{'js-open': isOpen}">
                <span v-html="selectLabel"></span>
                <svg viewBox="0 0 24 12" width="24px" height="12px" class="arrow" :class="{'js-active': isOpen}"  style="width: 24px; height: 12px;">
                    <polyline fill="none" stroke="currentColor" points="1,0.7 12,11 12,11 12,11 23,0.7 "/>
                </svg>
            </div>
        </div>
        <div class="select-list" :class="{'js-open': isOpen}">
            <ul>
                <li v-on:click="setSelected('', placeholder)" :class="{'js-selected': selectValue === defaultValue}" v-if="!required">{{ placeholder }}</li>
                <li v-for="option in this.dataObj" v-on:click="setSelected(option.value, option.label)" :class="{'js-selected': (selectValue === option.value)}">{{ option.label }}</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" src="./scripts/custom-select.ts"></script>
<style scoped src="../styles/styles-components/custom-select.css"></style>
