import {Vue} from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {loadJS} from '../../helpers/async-loader';
import {Action, Getter} from "vuex-class";

export default class GoogleMap extends Vue {
    @Prop({ type: Number, default: 0 })
    lat!: number;

    @Prop({ type: Number, default: 0 })
    long!: number;

    @Prop({ type: Number, default: 50 })
    scale!: number;

    @Prop({ type: Number, default: 15 })
    zoom!: number;

    @Prop({ type: String, default: null })
    apiKey!: string | null;

    @Prop({ type: String, default: null })
    markerIcon!: string | null;

    @Prop({ type: Number, default: 0 })
    markerWidth!: number;

    @Prop({ type: Number, default: 0 })
    markerHeight!: number;

    @Prop({ type: Boolean, default: false })
    personalized!: boolean;

    @Prop({ type: String, default: "" })
    stylesPath!: string;

    @Prop({ type: String, default: "" })
    cookiemsgSpecific!: string;

    @Prop({ type: String, default: "" })
    cookiemsgStart!: string;

    @Prop({ type: String, default: "" })
    cookiemsgLink!: string;

    @Prop({ type: String, default: "" })
    cookiemsgEnd!: string;

    @Prop({ type: String, default: "" })
    info!: string;

    isInitialized: boolean = false;
    isLoaded: boolean = false;
    map?: google.maps.Map;
    marker?: google.maps.Marker;

    showCookieMessage: boolean = false;

    @Action("openCookieSettings") openCookieSettings;

    @Getter("cookieConsentThirdparty") cookieConsentThirdparty;

    @Watch("lat")
    onLatChanged(newVal: number) {
        if (this.isLoaded && newVal !== 0 && this.long !== 0) {
            this.moveMap();
        }
    }

    @Watch("long")
    onLongChanged(newVal: number) {
        if (this.isLoaded && newVal !== 0 && this.lat !== 0) {
            this.moveMap();
        }
    }

    @Watch("cookieConsentThirdparty")
    onConsentAnalytics(isActive) {
        if(isActive) {
            this.launch();
        } else {
            this.destroy();
        }
    }

    created() {
        if(this.cookieConsentThirdparty){
            this.launch();
        }
    }

    async launch () {
        if (!this.apiKey) {
            // no API key provided. https://console.developers.google.com/apis/
            return;
        }

        window.google = window.google || {};

        if (!window.google.isMapsAlreadyLoading && !window.google.maps) {
            await loadJS(
                `https://maps.googleapis.com/maps/api/js?key=${this.apiKey!}`,
            );
            window.google.isMapsAlreadyLoading = true;
        }

        this.showCookieMessage = false;
        this.initMap();
    }

    /**
     * Center the map in case lat, long or other properties changed
     */
    moveMap() {
        const coords = new google.maps.LatLng(this.lat, this.long);
        google.maps.event.trigger(this.map, "resize");

        if (this.map) {
            this.map.setCenter(coords);
        }

        if (this.marker) {
            this.marker.setPosition(coords);
        }
    }

    /**
     * Setup Google Map
     */
    async initMap() {
        let styles;
        this.isInitialized = true;

        // Get personalized styles
        if (this.personalized) {
            styles = await fetch(this.stylesPath, { credentials: "include" })
                .then(response => response.json())
                .catch(() => { /* empty */ });
        }

        // Create Map
        this.map = new google.maps.Map((this.$refs as any).map, {
            gestureHandling: "cooperative",
            clickableIcons: false,
            zoom: this.zoom,
            center: { lat: 0, lng: 0 },
            // Custom styling from https://mapstyle.withgoogle.com/
            styles,
        });

        // Create Icon
        const icon =
            this.markerIcon && typeof this.markerIcon === "string"
                ? ({
                      url: this.markerIcon,
                      scaledSize: new google.maps.Size(
                          this.markerWidth,
                          this.markerHeight,
                      ),
                      anchor: new google.maps.Point(
                          this.markerWidth / 2,
                          this.markerHeight,
                      ),
                  } as google.maps.Icon)
                : undefined;

        this.marker = new google.maps.Marker({
            position: { lat: 0, lng: 0 },
            icon,
            map: this.map,
            optimized: false,
        });

        // Create Info Window
        if ( this.$slots && this.$slots.default) {
            if(this.$slots.default[0] && this.$slots.default[0].elm) {
                const infoElement = this.$slots.default[0].elm as HTMLElement;

                if (infoElement && infoElement.innerText.trim() !== "") {
                    const content = infoElement.cloneNode(true) as HTMLElement;
                    content.removeAttribute("hidden");

                    const infoWindow = new google.maps.InfoWindow({ content });
                    google.maps.event.addListener(this.marker, "click", () =>
                        infoWindow.open(this.map, this.marker),
                    );
                }
            }
        }

        this.isLoaded = true;
        if (this.lat !== 0 && this.long !== 0) {
            this.moveMap();
        }
    }

    destroy () {
        // Remove all component-specific Cookies
        // BrowserStorage.clearCookie('specific cookies');
        if(this.isInitialized) {
            location.reload();
            return;
        }
        this.showCookieMessage = true;
    }
}
