<template>
    <div>
        {{ message }} juhu
    </div>
</template>

<script>
    // TODO Remove Test Comp
    export default {
        name: "test-comp",
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