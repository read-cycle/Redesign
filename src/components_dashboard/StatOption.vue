<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

defineProps({
    header: String,
    text: String,
    icon: String
})

const optionContainer: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
  if(!optionContainer.value) return
  optionContainer.value.style.width = '100%';
  optionContainer.value.style.height = '100%';

  const { width, height } = optionContainer.value.getBoundingClientRect();

  if (height > width) {
    optionContainer.value.style.height = 'auto';
    optionContainer.value.style.width = '100%';
  } else {
    optionContainer.value.style.width = 'auto';
    optionContainer.value.style.height = '100%';
  }
  optionContainer.value.style.aspectRatio = '1/1';
})
</script>
<template>
<div class="stat-option" ref="optionContainer">
    <div class="icon-container" v-html="icon"></div> 
    <p class="stat-container-header">{{ header }}</p>
    <p class="stat-container-text">{{ text }}</p>
</div>
</template>
<style lang="scss" scoped>
.stat-option {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 10px;
  @extend %centered;
  flex-direction: column;
  border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
  overflow: hidden;
  align-self: center;
  justify-self: center;
}
.stat-container-header {
  font-family: 'Nunito';
}
.stat-container-text {
  font-family: 'Nunito';
}
@media screen and (max-width: 1025px) {
  .stat-container-header {
    font-size: px-to-vw(35);
  }
  .stat-container-text {
    font-size: px-to-vw(25);
  }
}
@media screen and (min-width: 1025px) {
  .stat-container-header {
    font-size: px-to-vw(14);
  }
  .stat-container-text {
    font-size: px-to-vw(12);
  }
}
@media screen and (max-width: 950px) {
  .stat-container-header {
    font-size: px-to-vw(40);
  }
  .stat-container-text {
    font-size: px-to-vw(34);
  }
}
@media screen and (max-width: 550px) {
  .stat-container-header {
    font-size: px-to-vw(60);
  }
  .stat-container-text {
    font-size: px-to-vw(40);
  }
}
</style>