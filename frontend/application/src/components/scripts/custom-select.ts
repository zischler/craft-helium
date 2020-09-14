import {mixins, props} from "vue-class-component";
import findKey from "lodash-es/findKey";
import BrowserStorage from "../../helpers/browser-storage";

const Props = props({
    dataJson: {
        type: String,
        default: ""
    },
    selectId: {
        type: String,
        default: ""
    },
    label: {
        type: String,
        default: ""
    },
    defaultPlaceholder: {
        type: String,
        default: ""
    },
    defaultValue: {
        type: String,
        default: ""
    },
    required: {
        type: Boolean,
        default: false
    },
    cookieStorage: {
        type: Boolean,
        default: false
    },
    eventEmit: {
        type: Boolean,
        default: false
    }
})

export default class CustomSelect extends mixins(Props) {
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

        if (this.cookieStorage) {
            initialValue = BrowserStorage.getCookie(this.selectId);
        }

        if (this.required && !this.defaultPlaceholder) {
            this.placeholder = "&nbsp;";
        } else {
            this.placeholder = this.defaultPlaceholder;
        }

        if (initialValue) {
            const selectedKey = findKey(this.dataObj, ['value', initialValue]);
            if (selectedKey && this.dataObj[selectedKey] && (this.dataObj[selectedKey] as any).value) {
                this.selectValue = initialValue;
                this.setSelected(this.selectValue, (this.dataObj[selectedKey] as any).label);
            }
        } else {
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

        if (this.cookieStorage) {
            BrowserStorage.setCookie(this.selectId, this.selectValue, 0.05)
        }

        if (this.eventEmit) {
            this.selectedObj = {"value": this.selectValue, "label": this.selectLabel};
        }

    }

    public focusSelect() {
        this.isOpen = false;
        if (!this.isOpen) {
            (this.$refs.select as HTMLElement).focus();
            this.isHidden = false;
        }
    }

    public openSelect() {
        this.isOpen = !this.isOpen;
    }

    private blurSelect() {
        this.isOpen = false;
        this.isHidden = true;
    }

    public changeSelect() {
        const selectedKey = findKey(this.dataObj, ['value', this.selectValue]);

        if (selectedKey && this.dataObj[selectedKey] && (this.dataObj[selectedKey] as any).value) {
            this.setSelected(this.selectValue, (this.dataObj[selectedKey] as any).label);
        } else {
            this.setSelected(this.defaultValue, this.placeholder);
        }
        this.isHidden = true;
    }
}