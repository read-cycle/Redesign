<script setup lang="ts">
import { type Ref, ref, onMounted } from 'vue';

defineProps({
    title: String,
    icon: String,
    scenario: String
})
const ctaCard: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
  if(!ctaCard.value) return
  ctaCard.value.style.width = '100%';
  ctaCard.value.style.height = '100%';

  const { width, height } = ctaCard.value.getBoundingClientRect();

  if (height > width) {
    ctaCard.value.style.height = 'auto';
    ctaCard.value.style.width = '100%';
  } else {
    ctaCard.value.style.width = 'auto';
    ctaCard.value.style.height = '100%';
  }
  ctaCard.value.style.aspectRatio = '1/1';
})
</script>
<template>
    <div class="cta-card-container">
      <div class="cta-card" ref="ctaCard">
        <div class="background-scenario" :style="{ backgroundImage: `url(${scenario})` }">
        </div>
        <div class="card-text">
          <div class="icon-container" v-html="icon"></div>
          <h1>{{ title }}</h1>
        </div>
      </div>
    </div>
</template>
<style lang="scss" scoped>
.cta-card-container {
  @extend %centered;
  .cta-card {
    position: relative;
    cursor: pointer;
    border: 2px solid $color-background;
    transition: box-shadow 0.4s ease;
    overflow: hidden;
    align-self: center;
    justify-self: center;
    &:hover {
        box-shadow: 0 0 0 4px $color-primary;
    }
    border-radius: 20px;
    .icon-container {
      color: $color-accent;
    }
    .card-text {
        @extend %filler;
        @extend %centered;
        flex-direction: column;
        position: relative;
        z-index: 4;
        text-align: center;
        font-family: 'Manrope';
        border-radius: inherit;
        background-color: rgba(red($color-secondary), green($color-secondary), blue($color-secondary), 0.8);
    }
    .background-scenario {
        position: absolute;
        top: 1px;
        left: 1px;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        z-index: 0;
        background-color: $color-accent-lightened;
        border-radius: inherit;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
    }
  }
}
@media screen and (max-width: 1025px) {
  .card-text {
    font-size: px-to-vw(20);
  }
}
@media screen and (min-width: 1025px) {
  .card-text {
    font-size: px-to-vw(15);
  }
}
@media screen and (max-width: 950px) {
  .card-text {
    font-size: px-to-vw(27.5);
  }
}
@media screen and (max-width: 550px) {
  .card-text {
    font-size: px-to-vw(40);
  }
}
</style>