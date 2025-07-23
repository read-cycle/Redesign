<script setup lang="ts">
import { onMounted, ref } from 'vue';

const passwordHidden = ref(true);

onMounted(() => {
    const deleteBtn = document.querySelector(".optional-deleter") as HTMLElement;
    const inputBox = document.querySelector(".input-box") as HTMLInputElement;

    deleteBtn.addEventListener("click", () => {
        inputBox.value = "";
    })
})
</script>
<template>
    <div class="input-box-container">
        <div class="input-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail input-icon"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
        </div>
        <input :type="passwordHidden ? 'password' : 'text'" class="input-box" :placeholder="'example@abc.com'">
        <label class="input-label">Email</label>
        <div class="optional-buttons">
            <div class="optional-deleter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
            <div class="optional-hider" @click="passwordHidden = !passwordHidden">
                <svg v-if="passwordHidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.input-box-container {
    position: relative;
    width: 100%;
    aspect-ratio: 6/1;
    display: flex;
    font-family: 'Nunito';
    border-radius: 30px;
    &:focus-within {
      box-shadow: 0 0 5px 2px rgba(42, 109, 244, 0.3);
    }
}
.input-label {
    position: absolute;
    left: 20%;
    top: -12.5%;
    font-size: 10px;
    background-color: transparent; //use material design-like elements
    padding: 0 0.25rem;
}
.input-icon-container {
    aspect-ratio: 1/1;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 5px;
    border: 1px lightgray solid;
    .input-icon {
        width: 50%;
        aspect-ratio: 1/1;
    }
}
.input-box {
    width: 100%;
    height: 100%;
    padding: 1rem 0.5rem;
    padding-right: 25%;
    border: 1px lightgray solid;
    border-left: none;
    outline: none;    
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
}
.optional-buttons {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    height: 50%;
    left: 75%;
    div {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        svg {
            width: 75%;
            transition: color 200ms ease-in-out;
        }
    }
    .optional-deleter {
        &:hover {
            color: red;
        }
    }
}
</style>