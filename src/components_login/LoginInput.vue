<script setup lang="ts">
import { onMounted, ref } from 'vue';

defineProps<{
  fieldName: string,
  placeholder?: string,
  fieldIcon?: string,
  isPassword?: boolean
}>()

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
    <form>
    <fieldset class="input-box-container">
        <legend>{{ fieldName }}</legend>
        <div class="input-icon-container" v-html="fieldIcon">

        </div>
<input
  ref="inputRef"
  :type="isPassword ? (passwordHidden ? 'password' : 'text') : 'text'"
  class="input-box"
  :placeholder="placeholder"
  :style="{ marginRight: isPassword ? '25%' : '15%' }"
/>        <div class="optional-buttons">
            <div class="optional-deleter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
            <div class="optional-hider" @click="passwordHidden = !passwordHidden" v-if="isPassword">
                <svg v-if="passwordHidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
            </div>
        </div>
    </fieldset>
    </form>
</template>
<style lang="scss" scoped>
@keyframes subtleWiggle {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-1px);
  }
  75% {
    transform: translateY(1px);
  }
}
.input-box-container {
    position: relative;
    width: 100%;
    aspect-ratio: 5/1;
    display: flex;
    font-family: 'Nunito';
    border-radius: 30px;
    border: 1px solid $color-accent;
    &:focus-within {
      box-shadow: 0 0 5px 2px rgba($color-accent-lightened, 0.5);
      ::v-deep .input-icon-container svg {
        animation: subtleWiggle 5s ease-in-out infinite;
      }
    }
    legend {
        font-size: px-to-vw(10);
        margin: px-to-vw(-6);
        margin-inline-start: px-to-vw(55);
        z-index: 20;
    }
}
::v-deep .input-icon-container {
    aspect-ratio: 1/1;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 5px;
    border-right: 1px solid lightgray;
    svg {
        width: 50%;
        aspect-ratio: 1/1;
    }
}
.input-box {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;    
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    padding-left: 5px;
    font-size: px-to-vw(14);
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