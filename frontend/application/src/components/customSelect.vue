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

<script lang="ts">
    import {Vue} from "vue-class-component";
    import {Prop} from "vue-property-decorator";
    import findKey from "lodash-es/findKey";
    import BrowserStorage from "../helpers/browser-storage";

    export default class customSelect extends Vue {
        @Prop({ type: String, default: "" })
        dataJson!: string;

        @Prop({type: String, default: ""})
        public selectId: string;

        @Prop({type: String, default: ""})
        public label: string;

        @Prop({type: String, default: ""})
        public defaultPlaceholder: string;

        @Prop({type: String, default: ""})
        public defaultValue: string;

        @Prop({type: Boolean, default: false})
        public required: boolean;

        @Prop({type: Boolean, default: false})
        public cookieStorage: boolean;

        @Prop({type: Boolean, default: false})
        public eventEmit: boolean;

        public isOpen = false;
        public isHidden = true;
        public selectValue: string = "";
        public selectLabel: string = "";
        public placeholder: string = "";
        public dataObj: any;
        public selectedObj: {};

        public created() {
            this.dataObj = this.dataJson ? JSON.parse(decodeURIComponent(this.dataJson)) : "";
            if (!this.dataObj) {
                throw new Error("json is void");
            }
            let initialValue = this.defaultValue;

            if(this.cookieStorage) {
                initialValue = BrowserStorage.getCookie(this.selectId);
            }

            if(this.required && !this.defaultPlaceholder) {
                this.placeholder = "&nbsp;";
            } else {
                this.placeholder = this.defaultPlaceholder;
            }

            if(initialValue) {
                const selectedKey = findKey(this.dataObj, ['value', initialValue]);
                if(selectedKey && this.dataObj[selectedKey] && (this.dataObj[selectedKey] as any).value) {
                    this.selectValue = initialValue;
                    this.setSelected(this.selectValue, (this.dataObj[selectedKey] as any).label);
                }
            }
            else {
                this.selectValue = this.defaultValue;
                this.selectLabel = this.placeholder;
            }
        }

        public mounted() {
            this.setSelected(this.selectValue, this.selectLabel);

            window.addEventListener("click", e => {
                if (this.$el !== e.target && !(this.$el as any).contains(e.target as Node)) {
                    this.$nextTick().then(() => {
                        this.blurSelect();
                    })
                }
            });
        }

        private setSelected(optionValue: string, optionLabel: string) {

            this.selectValue = optionValue;
            this.selectLabel = optionLabel;
            this.isOpen = false;

            if(this.cookieStorage) {
                BrowserStorage.setCookie(this.selectId,this.selectValue,0.05)
            }

            if(this.eventEmit) {
                this.selectedObj = {"value": this.selectValue,"label": this.selectLabel};
            }

        }

        public focusSelect() {
            this.isOpen = false;
            if(!this.isOpen) {
                (this.$refs.select as HTMLElement).focus();
                this.isHidden = false;
            }
        }

        public openSelect() {
            if(!this.isOpen) {
                this.isOpen = true;
            } else {
                this.isOpen = false;
            }
        }

        private blurSelect() {
            this.isOpen = false;
            this.isHidden = true;
        }

        public changeSelect() {
            const selectedKey = findKey(this.dataObj, ['value', this.selectValue]);

            if(selectedKey && this.dataObj[selectedKey] && (this.dataObj[selectedKey] as any).value) {
                this.setSelected(this.selectValue, (this.dataObj[selectedKey] as any).label);
            } else {
                this.setSelected(this.defaultValue, this.placeholder);
            }
            this.isHidden = true;
        }
    }
</script>
<style scoped>
    @import url(../variables.css);

    .custom-select {
        position: relative;
    }

    select,
    option {
        font-weight: inherit;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        border: 0;
        border-radius: 0;
        appearance: none;
    }

    select {
        position: absolute !important;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: inline-block;
        border: 1px solid var(--dark);
        border-radius: 4px;
    }

    select:focus {
        border-color: hsl(var(--form-active-color));
    }

    select::-ms-expand {
        display: none;
    }

    select::-ms-value {
        background: none;
    }

    .select-input {
        line-height: 48px;
        position: relative;
        background-color: var(--light);
        min-height: 50px;
        display: inline-block;
        width: 100%;
        cursor: pointer;
    }

    .select-placeholder {
        display: inline-block;
        vertical-align: middle;
        line-height: 0;
        width: 100%;
        border-radius: 4px;
        border: 1px solid var(--dark);
        box-shadow: 0 0 0 1000px var(--light) inset!important;
    }

    select:focus + .select-placeholder,
    .select-placeholder.js-open {
        outline: 0;
        border-color: hsl(var(--form-active-color));
        background: hsla(var(--form-active-color), 0);
        box-shadow: 0 0 4px hsla(var(--form-active-color), 0.7), 0 0 0 1000px white inset!important;
    }

    .-once-submitted select:required:invalid + .select-placeholder {
        outline: 0;
        border-color: hsl(var(--form-error-border-color));
        box-shadow: 0 0 0 1000px hsla(var(--form-error-background), 1) inset!important;
        background: hsla(var(--form-error-border-color), 0.07)!important;
        color: hsl(var(--form-error-text-color));
    }

    @media (--for-md-up) {
        select, .select-placeholder {
            padding: 0.75em 2em 0.85em 1em;
        }
    }

    @media (--for-sm-down) {

        select, .select-placeholder {
            padding: 0.5em 1em 0.6em;
        }
    }

    .select-placeholder > span {
        padding-right: 25px;
        line-height: 1.25em;
        display: inline-block;
        hyphens: auto;
    }

    .arrow {
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translate(0, -50%);
        transition: transform 0.2s ease-out;
    }

    .arrow.js-active {
        transform: translate(0, -50%) rotate(180deg);
    }

    .select-list {
        background-color: var(--light);
        border: 1px solid var(--dark);
        border-radius: 4px;
        width: 100%;
        position: absolute;
        left: 0;
        top: calc(100% + 10px);
        opacity: 0;
        visibility: hidden;
        z-index: 4;
        max-height: 250px;
        overflow-y: auto;
        transition: opacity 0.2s ease-in-out;
        padding: 0.25em 0;
    }

    .select-list > ul > li {
        list-style: none;
        padding: 0.5rem 1em;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        margin: 0;
    }

    .select-list > ul > li:before {
        content: none;
    }

    .select-list > ul > li.js-selected {
        background-color: var(--light-gray);
    }

    @media (--for-pointing-device) {
        select.hidden {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            margin: -1px !important;
            border: 0 !important;
            padding: 0 !important;
            white-space: nowrap !important;
            clip-path: inset(100%) !important;
            clip: rect(0 0 0 0) !important;
            overflow: hidden !important;
            opacity: 0;
        }
        .select-list > ul > li:hover {
            background-color: var(--light-gray);
        }
        .select-list.js-open {
            opacity: 1;
            visibility: visible;
        }
    }
</style>
