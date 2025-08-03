<script setup lang="ts">

import { nextTick, onMounted, ref } from 'vue';
import { random_icons } from '../mappings';

const concurrentDrawingIcons = 5

const iconPositions = ref(
  Array.from({ length: concurrentDrawingIcons }, () => ({ top: '0px', left: '0px', icon: "" }))
)

onMounted(() => {
  const container = document.querySelector(".random-container") as HTMLElement
  const contWidth = container.clientWidth
  const contHeight = container.clientHeight
  const cellSize = contWidth / 40
  const cellsX = 40
  const cellsY = Math.floor(contHeight / cellSize)

  const usedPositions = new Set<string>();
  const usedIndexes = new Set<number>();
  
  function getUniqueIconIndex(): number {
    if (usedIndexes.size === random_icons.length) usedIndexes.clear();
    let idx = Math.floor(Math.random() * random_icons.length);
    while (usedIndexes.has(idx)) {
      idx = Math.floor(Math.random() * random_icons.length);
    }
    usedIndexes.add(idx);
    return idx;
  }
  
  const getRandomCellData = () => {
    if (usedPositions.size >= cellsX * cellsY) usedPositions.clear();
  
    let x = Math.floor(Math.random() * cellsX);
    let y = Math.floor(Math.random() * cellsY);
    let key = `${x},${y}`;
  
    while (usedPositions.has(key)) {
      x = Math.floor(Math.random() * cellsX);
      y = Math.floor(Math.random() * cellsY);
      key = `${x},${y}`;
    }
    usedPositions.add(key);
  
    const idx = getUniqueIconIndex();
    return {
      left: `${x * cellSize}px`,
      top: `${y * cellSize}px`,
      icon: random_icons[idx],
    };
  };


  for (let i = 0; i < concurrentDrawingIcons; i++) {
      iconPositions.value[i] = getRandomCellData();

    setInterval(() => {
      iconPositions.value[i] = getRandomCellData();
    }, 12000 + Math.random() * 5000)
  }

  nextTick(() => {
    document.querySelectorAll('svg > *').forEach((el) => {
        const length = (el as SVGGeometryElement).getTotalLength();
        (el as SVGGeometryElement).style.strokeDasharray = length.toString();
        (el as SVGGeometryElement).style.strokeDashoffset = length.toString();
    });
  })
})

</script>
<template>
  <div class="random-container">
    <div
      v-for="(data, i) in iconPositions"
      :key="i + '-' + data.icon"
      class="icon-container"
      :style="{ top: data.top, left: data.left }"
      v-html="data.icon"
    >
    </div>
  </div>
</template>
<style lang="scss" scoped>
.random-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.icon-container {
    position: absolute;
    width: 5%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
}
::v-deep svg {
    width: 50%;
    height: 50%;
    opacity: 0.2;
}
::v-deep svg * {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  opacity: 0;
  animation: fadeIn 3s ease-in-out forwards, draw ease-in-out 7s forwards, fadeOut 3s ease-in-out 9s forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>