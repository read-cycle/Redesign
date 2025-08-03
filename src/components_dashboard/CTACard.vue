<script setup lang="ts">
defineProps({
    title: String,
    icon: String,
    scenario: String
})
</script>
<template>
    <div class="cta-card-container">
      <div class="cta-card">
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
  height: 100%;
  .cta-card {
    position: relative;
    height: 100%;
    aspect-ratio: 1 / 1;
    border: 1px solid $color-accent;
    border-radius: 20px;
    cursor: pointer;
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
        font-size: 15px;
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
</style>