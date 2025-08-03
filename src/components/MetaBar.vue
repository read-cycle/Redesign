<script setup lang="ts">
import MetabarBtn from './MetabarBtn.vue';
const btnData = [
    ["notification-btn", '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-icon lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>'], 
    ["notification-btn", '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>']
]
defineProps({
    title: String
})
</script>
<template>
    <div class="meta-container">
        <h1 class="page-header">{{ title }}</h1>
        <MetabarBtn v-for="item in btnData" :type="item[0]" :icon="item[1]"></MetabarBtn>
    </div>
</template>
<style lang="scss" scoped>
.meta-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}
.page-header {
    font-family: 'Manrope';
    margin-right: auto;
    color: $color-accent;
}
</style>