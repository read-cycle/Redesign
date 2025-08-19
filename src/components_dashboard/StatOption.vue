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

  const shouldSwap = window.innerWidth < 850;
  const condition = shouldSwap ? (height > width) : (width > height);

  if (condition) {
    optionContainer.value.style.height = 'auto';
    optionContainer.value.style.width = '100%';
  } else {
    optionContainer.value.style.width = 'auto';
    optionContainer.value.style.height = '100%';
  }
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
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 10px;
  display: flex;
  @extend %centered;
  flex-direction: column;
  border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
}
.stat-container-header {
  font-family: 'Nunito';
}
.stat-container-text {
  font-family: 'Nunito';
}
@media screen and (max-width: 550px) {
  .stat-container-header {
    font-size: px-to-vw(40);
  }
  .stat-container-text {
    font-size: px-to-vw(34);
  }
}
@media screen and (min-width: 550px) {
  .stat-container-header {
    font-size: px-to-vw(23);
  }
  .stat-container-text {
    font-size: px-to-vw(20);
  }
}
@media screen and (min-width: 850px) {
  .stat-container-header {
    font-size: px-to-vw(14);
  }
  .stat-container-text {
    font-size: px-to-vw(12);
  }
}
</style>