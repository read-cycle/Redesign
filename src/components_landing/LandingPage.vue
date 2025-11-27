<script setup lang="ts">
import Hero from './Hero.vue'
import Navbar from './Navbar.vue';
import Abt from './Abt.vue';
import HIW from './HIW.vue';
import ContactUs from './ContactUs.vue';
</script>
<template>
    <Navbar></Navbar>
    <div class="page-container">
        <Hero></Hero>
        <Abt></Abt>
        <HIW></HIW>
        <ContactUs></ContactUs>
    </div>
</template>
<style lang="scss" scoped>
.page-container {
    width: 100%;
    height: 400%;
}
</style>