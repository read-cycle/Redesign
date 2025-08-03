<script setup lang="ts">
defineProps({
    header: String,
    text: String,
    icon: String
})
</script>
<template>
<div class="stat-option">
    <div class="icon-container" v-html="icon"></div> 
    <p class="stat-container-header">{{ header }}</p>
    <p class="stat-container-text">{{ text }}</p>
</div>
</template>
<style lang="scss" scoped>
.stat-option {
    flex: 1;
    height: 100%;
    aspect-ratio: 1/1;
    border-radius: 10px;
    display: flex;
    @extend %centered;
    flex-direction: column;
    border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
}
.stat-container-header {
    font-size: 14px;
    font-family: 'Nunito';
}
.stat-container-text {
    font-size: 12px;
    font-family: 'Nunito';
}
</style>