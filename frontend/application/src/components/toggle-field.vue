<template>
  <div @click.capture="toggleActive">
    <slot></slot>
  </div>
</template>

<script lang="ts" src="./scripts/toggle-field.ts"></script>
