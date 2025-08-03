<script setup lang="ts">
defineProps({
    icon: String,
    type: String
})
</script>
<template>
    <button class="meta-button" :class="type" v-html="icon"></button>
</template>
<style lang="scss" scoped>
.meta-button {
    height: 65%;
    aspect-ratio: 1/1;
    background-size: 50% 50%;
    background-repeat: no-repeat;
    background-position: center center;
    border: none;
    background-color: transparent;
    cursor: pointer;
}
</style>