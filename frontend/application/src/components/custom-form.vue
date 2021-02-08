<template>
    <form method="post" action="" @submit="sendForm" accept-charset="UTF-8" class="relative w-full mt-8" ref="form">
        <fieldset>
            <slot name="csrf"></slot>
            <input type="hidden" name="action" :value="action">

            <div class="relative mb-6">
                <custom-select
                        :data-json="customSelectValues"
                        select-id="message[salutation]" :label="$t('form.salutation')"
                        :default-placeholder="$t('form.salutation')"></custom-select>
            </div>

            <div class="relative mb-6">
                <div class="input-wrapper">
                    <input id="from-name" type="text" name="fromName" :placeholder="$t('form.name')+' *'" @input="onInput" autocomplete="given-name" required>
                    <label for="from-name">{{ $t("form.name")}} *</label>
                    <template v-if="!!errors.fromName">{{ errors.fromName }}</template>
                </div>
            </div>

            <div class="relative mb-6">
                <div class="input-wrapper">
                    <input id="surname" type="text" name="message[Surname]" :placeholder="$t('form.surname')+' *'" @input="onInput" autocomplete="family-name" required>
                    <label for="surname">{{ $t('form.surname') }} *</label>
                    <template v-if="!!errors.message.surname">{{ errors.message.surname }}</template>
                </div>
            </div>

            <div class="relative mb-6">
                <div class="input-wrapper">
                    <input id="from-email" type="email" name="fromEmail" :placeholder="$t('form.email')+' *'" @input="onInput" required>
                    <label for="from-email">{{ $t('form.email') }} *</label>
                </div>
            </div>

            <div class="relative mb-6">
                <div class="input-wrapper">
                    <input id="subject" type="text" name="subject" :placeholder="$t('form.subject')" @input="onInput">
                    <label for="subject">{{ $t('form.subject') }}</label>
                    <template v-if="!!errors.subject">{{ errors.subject }}</template>
                </div>
            </div>

            <div class="relative mt-8 mb-6">
                <textarea class="block" rows="10" cols="40" id="message" name="message[body]" :placeholder="$t('form.message')+' *'" @input="onInput" required></textarea>
                <label for="message">{{ $t('form.message') }} *</label>
                <template v-if="!!errors.message.body">{{ errors.message.body }}</template>
            </div>

            <div class="relative">
                <div class="checkbox-wrapper">
                    <input name="message[privacy]" id="privacy" required type="checkbox" @click="onPrivacyClick()" @input="onInput">
                    <label class="checkbox-label static" for="privacy">
                        {{ $t('form.privacyText') }}
                        <a v-if="!!dataPolicyPage" :href="dataPolicyPage" target="_blank">{{ $t('form.privacy') }}</a>.
                        <div class="mt-1 text-sm">
                            {{ $t('form.recaptchaText') }}
                            <a class="link" href="https://policies.google.com/privacy" target="_blank">{{ $t('form.dataPolicy') }}</a> {{ $t('form.and') }}
                            <a class="link" href="https://policies.google.com/terms" target="_blank">{{ $t('form.terms') }}</a>{{ $t('form.recaptchaTextEnd') }}
                        </div>
                    </label>
                    <template v-if="!!errors.message.privacy">{{ errors.message.privacy }}</template>
                </div>
            </div>

            <input type="hidden" class="hidden" id="g-recaptcha-response" name="g-recaptcha-response" value="" :model="recaptchaToken">
            <div class="relative mt-8">
                <input type="submit" :value="$t('form.submit')">
            </div>

            <div class="relative mt-8">
                <p class="message notice" v-if="success">{{ successMessage }}</p>
                <p class="message error text-red-400" v-if="error">{{ errorMessage }}</p>
            </div>
        </fieldset>
    </form>
</template>

<script lang="ts" src="./scripts/custom-form.ts"></script>