<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isCooldown = ref(false);
const delta = ref(0);
const currentSlide = ref(0);
const containerRef = ref<HTMLElement | null>(null);

function isInScrollZone(): boolean {
  const el = containerRef.value;
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const tolerance = 50; // allows ~5px leeway

  return (
    Math.abs(rect.top) <= tolerance &&
    Math.abs(rect.bottom - window.innerHeight) <= tolerance
  );
}



onMounted(() => {
  window.addEventListener("wheel", (e) => {
    if (!isInScrollZone() || isCooldown.value) return;

    const deltaY = (e as WheelEvent).deltaY;
    delta.value += deltaY;

    let shouldPrevent = true;

    if (delta.value <= -600) {
      currentSlide.value--;
      delta.value = 0;
    }

    if (delta.value >= 600) {
      currentSlide.value++;
      delta.value = 0;
    }

    if (currentSlide.value >= 4) {
      currentSlide.value = 0;
      shouldPrevent = false;
    }

    if (currentSlide.value <= -1) {
      currentSlide.value = 0;
      shouldPrevent = false;
    }

    if (isCooldown.value) {
      setTimeout(() => {
        isCooldown.value = false;
      }, 800);
    }

    if (shouldPrevent) {
      e.preventDefault();
    }
  }, { passive: false });
});

</script>
<template>
    <div class="hiw-container" ref="containerRef" id="how-it-works">
        <div class="content-container" :style="{transform: `translateY(-${currentSlide * 25}%)`}">
            <div class="vertical-indicator">
              <div
                v-for="n in 4"
                :key="n"
                class="dot"
                :class="'dot-'+n"
                :style="{ top: (25 * (n - 1) + 9.5) + '%' }"
              >{{ n }}</div>
              <div class="vertical-indicator-line"></div>
            </div>
            <div class="slide slide-1">
                <div class="slide-content">
                    <h1>How does it work?</h1>
                    <p>A quick walkthrough of how you can give or receive books with ReadCycle — it's as easy as 1, 2, 3!</p>
                </div>
            </div>
            <div class="slide slide-2">
              <div class="slide-content">
                <h1>Step 1: Got Old Books?</h1>
                <p>List your textbooks in just a few clicks — no stress, no pricing, just helping someone out.</p>
              </div>
            </div>
            <div class="slide slide-3">
              <div class="slide-content">
                <h1>Step 2: Someone Needs It!</h1>
                <p>Juniors browse ReadCycle for the books they need. If yours matches, boom — they reach out.</p>
              </div>
            </div>
            <div class="slide slide-4">
              <div class="slide-content">
                <h1>Step 4: One Less Book Wasted</h1>
                <p>That's it! You've made someone's day (and cleared your shelf). Every reused book counts.</p>
              </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.hiw-container {
    width: 100%;
    height: 100dvh;
    overflow: hidden;
    position: relative;
    background-color: $color-background;
}
.content-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 400%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    transition: transform 0.6s ease;
    .vertical-indicator {
      position: absolute;
      left: 50%;
      top: 0;
      width: 50px;
      height: 100%;
      transform: translateX(-50%);
      .dot {
        position: absolute;
        width: 100%;
        aspect-ratio: 1/1;
        border-radius: 50px;
        border: $color-primary 1px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Nunito';
        font-size: px-to-vw(20);
        background-color: $color-background;
        z-index: 4;
      }
      .vertical-indicator-line {
        position: absolute;
        top: 9.5%;
        height: 75%;
        width: 2px;
        left: 50%;
        transform: translate(-50%);
        background-color: $color-primary;
        z-index: 3;
      }
    }
}
.slide  {
    width: 100%;
    height: 100%;
}
.slide-1 {
    display: flex;
    align-items: center;
    justify-content: center;
    .slide-content {
        display: flex;
        align-items: center;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        z-index: 4;
        h1 {
          font-family: 'Manrope';
          font-weight: 700;
          font-size: px-to-vw(40);
        }
        p {
          font-family: 'Nunito';
          font-size: px-to-vw(17);
        }
    }
}
.slide-2 {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .slide-content {
    padding: 4rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: right;
    z-index: 4;
    h1 {
      font-family: 'Manrope';
      font-weight: 700;
      font-size: px-to-vw(40);
    }
    p {
      font-family: 'Nunito';
      font-size: px-to-vw(17);
    }
  }
}
.slide-3 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .slide-content {
    padding: 4rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    z-index: 4;
    h1 {
      font-family: 'Manrope';
      font-weight: 700;
      font-size: px-to-vw(40);
    }
    p {
      font-family: 'Nunito';
      font-size: px-to-vw(17);
    }
  }
}
.slide-4 {
  display: flex;
  align-items: center;
  justify-content: center;
  .slide-content {
    padding: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 4;
    h1 {
      font-family: 'Manrope';
      font-weight: 700;
      font-size: px-to-vw(40);
    }
    p {
      font-family: 'Nunito';
      font-size: px-to-vw(17);
    }
  }
}
</style>