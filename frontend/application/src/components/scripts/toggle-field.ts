import {Vue} from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";

export default class ToggleField extends Vue {
  @Prop({ type: String, default: "" })
  defaultValue!: string;

  @Prop({ default: null })
  reportTo!: any;

  isActive = false;
  isInitialized = true;
  content = "";

  created() {
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
      this.isInitialized = false;
      document.addEventListener("click", () => {
        this.isInitialized = true;
      });
    }
  }
  mounted() {
    if (this.defaultValue !== "") {
      this.content = this.defaultValue;
    }
  }

  @Watch("content")
  onContentChange(value) {
    this.$parent[this.reportTo] = value;
  }

  public toggleActive(event: MouseEvent) {
    if (event.target instanceof Element) {
      let parent = event.target.parentElement as Element;
      let textNode = parent.nextElementSibling as Element;
      if (
        event.target.tagName == "H2" &&
        !parent.classList.contains("active")
      ) {
        parent.classList.add("active");
        textNode.classList.add("active");
      } else {
        parent.classList.remove("active");
        textNode && textNode.classList.remove("active");
      }
    }

    this.isActive = this.content !== "";
  }
}
