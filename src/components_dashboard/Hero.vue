<script setup>
import { onMounted } from 'vue';
import CTACard from './CTACard.vue';
import chats from '../assets/images/chats.svg'
import browse from '../assets/images/browse2.svg'
import upload from '../assets/images/scan.svg'
import router from '../router';
const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search2-icon lucide-file-search-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-icon lucide-message-square"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>']
</script>
<template>
<div class="cta">
  <div class="text-container">
    <h1 class="cta-header">Welcome Back, Nikhil.</h1>
    <p class="cta-para">Below are some quick actions for you to get started.</p>
  </div>
  <div class="card-track">
    <c-t-a-card :title="'Browse Books'" :icon="icons[0]" :scenario='browse' @click="router.push('/browser')"></c-t-a-card>
    <c-t-a-card :title="'Upload Books'" :icon="icons[1]" :scenario='upload' @click="router.push('/upload')"></c-t-a-card>
    <c-t-a-card :title="'Chats'" :icon="icons[2]" :scenario='chats' @click="router.push('/chats')"></c-t-a-card>
  </div>
</div>
</template>
<style lang="scss" scoped>
.cta {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .text-container {
    width: 100%;
    @extend %centered;
    flex-direction: column;
    .cta-header {
      background: linear-gradient(to right, $color-primary, $color-accent);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-family: 'Manrope';
    }
    .cta-para {
      font-family: 'Nunito';
    }
  }
  .card-track {
    height: 75%;
    width: 100%;
    display: grid;
    column-gap: 1vw;
    padding: 1vw;
  }
}
@media screen and (max-width: 1025px) {
  .cta-header {
    font-size: px-to-vw(70);
  }
  .cta-para {
    font-size: px-to-vw(30);
  }
  .card-track {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
    gap: 5px;
  }
  .cta {
    grid-row: 3 / 41;
    grid-column: 20 / 60;
    .text-container {
      height: 10%;
    }
  }
}
@media screen and (min-width: 1025px) {
  .cta-header {
    font-size: px-to-vw(48);
  }
  .cta-para {
    font-size: px-to-vw(16);
  }
  .card-track {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  }
  .cta {
    grid-row: 3 / 12;
    grid-column: 4 / 18;
    gap: 0;
    .text-container {
      height: 25%;
    }
  }
}
@media screen and (max-width: 950px) {
  .cta-header {
    font-size: px-to-vw(90);
  }
  .cta-para {
    font-size: px-to-vw(37.5);
  }
}
@media screen and (max-width: 550px) {
  .cta-header {
    font-size: px-to-vw(90);
  }
  .cta-para {
    font-size: px-to-vw(34);
  }
}
</style>