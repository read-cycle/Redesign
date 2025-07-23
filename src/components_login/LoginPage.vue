<script setup lang="ts">
import LoginInputPassword from './LoginInputPassword.vue';
</script>
<template>
    <div class="login-container">
        <div class="input-container">
            <LoginInputPassword></LoginInputPassword>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.login-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.input-container {
    width: 200px;
}
</style>