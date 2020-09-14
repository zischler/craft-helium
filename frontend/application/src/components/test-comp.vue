<template>
    {{ message }} juhu
</template>

<script>
    // TODO Remove Test Comp
    export default {
        name: "Test Comp",
        data() {
            return {
                message: "test Message"
            }
        },
        mounted() {
            console.log("test");
        }
    }
</script>

<style scoped>

</style>