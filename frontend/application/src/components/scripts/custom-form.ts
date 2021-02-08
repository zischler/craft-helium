import {Vue, prop} from "vue-class-component";
import {IReCaptchaComposition, useReCaptcha} from 'vue-recaptcha-v3';

class Props {
    dataPolicyPage = prop<string>({
        default: '',
    });
    successMessage = prop<string>({
        default: 'Your message has been sent',
    });
    errorMessage = prop<string>({
        default: 'An error occurred while sending the form, please try again later.',
    });
}

export default class CustomForm extends Vue.with(Props) {
    customSelectValues = [
        { value: 'sir', label: 'Sir' },
        { value: 'madam', label: 'Madam' },
        { value: 'diverse', label: 'Diverse'}
    ];
    action = 'contact-form/send';
    success = false;
    error = false;
    errors: object = { message: {}};
    recaptchaToken: string = '';
    recaptcha: IReCaptchaComposition;

    mounted() {
        const recaptcha = useReCaptcha();
        if (!!recaptcha) {
            this.recaptcha = recaptcha;
        }
    }

    onPrivacyClick() {
        if(this.recaptcha) {
            this.recaptcha.recaptchaLoaded().then(() => {
                // Execute reCAPTCHA with action "login".
                this.recaptcha.executeRecaptcha('submit').then((token) => {
                    this.recaptchaToken = token;
                });
            });
        }
    }

    sendForm(e) {
        e.preventDefault();

        const data = new FormData((this.$refs.form as HTMLFormElement));

        fetch('/', {
            method: 'POST',
            credentials: 'include',
            body: data,
        }).then(response => {
            if (response.status === 200) {
                this.success = true;
                this.error = false;
            } else if (response.status >= 500) {
                this.error = true;
                this.success = false;
            } else if (response.status >= 400) {
                // @ts-ignore
                const errors = response.errors;
                if(errors) {
                    this.errors = errors;
                }
                this.error = true;
                this.success = false;
            }
        }).catch(error => {
            console.error(error);
            this.error = true;
            this.success = false;
        });
    }

    onInput(e) {
        const el = e.target;
        el.classList.add('dirty');
    }
}