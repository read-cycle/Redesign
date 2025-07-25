<script setup lang="ts">
import { onMounted } from 'vue';
import { manropeGlyphData } from '../mappings';
import peep1 from '@/assets/images/peep-1.svg';
import peep2 from '@/assets/images/peep-2.svg';
import peep3 from '@/assets/images/peep-3.svg';
import peep4 from '@/assets/images/peep-4.svg';
import RandomIconDrawer from './RandomIconDrawer.vue';

function getGlyphBox(el: { childNodes: any; }, letterIndex: number) {
  const textNode = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
  if (!textNode) return null;
  const range = document.createRange();
  range.setStart(textNode, letterIndex);
  range.setEnd(textNode, letterIndex + 1);
  const rect = range.getBoundingClientRect();
  return rect;
}
function getManropeOGlyphMetrics(
  char: string,
  fontSizePx: number,
  lineIndex: number = 0,
  lineHeight: number = 0.9
) {
  const scaleWidth = (basePx: number) => (basePx / 1920) * window.innerWidth;
  const unitsPerEm = 2000;
  const glyph = manropeGlyphData[char as keyof typeof manropeGlyphData];

  const width = (glyph.widthUnits / unitsPerEm) * fontSizePx;
  const height = (glyph.heightUnits / unitsPerEm) * fontSizePx;
  const topOffset = (glyph.topOffsetUnits / unitsPerEm) * fontSizePx;

  const lineOffset = fontSizePx * lineHeight * lineIndex;

  return {
    width,
    height,
    top: lineOffset + topOffset + scaleWidth(10)
  };
}

const glyphIndices = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]

onMounted(async () => {
    await document.fonts.ready;
    const highlightedText = document.querySelector(".hero-highlighted") as HTMLElement;
    const content = highlightedText.textContent ?? '';
    let peepBoxes = []
    for(let i = 0; i < glyphIndices.length; i++) {
        const glyphIndex = glyphIndices[i];
        const char = content[glyphIndex];
        const glyphRect = getGlyphBox(highlightedText, glyphIndex);
        const parentRect = highlightedText.getBoundingClientRect();

        if (glyphRect) {
          const box = document.createElement('div');

          peepBoxes.push(box);

          box.classList.add('peep-box');

          const fontSize = parseFloat(getComputedStyle(highlightedText).fontSize);
          const { width, height, top } = getManropeOGlyphMetrics(char, fontSize);

          box.style.position = "absolute";
          box.style.left = `${glyphRect.left - parentRect.left}px`;
          box.style.top = `${top}px`;
          box.style.width = `${width}px`;
          box.style.height = `${height}px`;

          highlightedText.appendChild(box);
        }
    }

    const scaleWidth = (basePx: number) => (basePx / 1920) * window.innerWidth;

    const redBox = document.createElement("div");
    redBox.style.background = `url('${peep1}')`;
    redBox.style.backgroundRepeat = "no-repeat";
    redBox.style.backgroundSize = "contain";
    redBox.style.backgroundPosition = "center center";
    redBox.style.position = "absolute";
    redBox.style.top = `${scaleWidth(10)}px`;
    redBox.style.left = "50%";
    redBox.style.transform = "translate(-50%)";
    redBox.style.width = `${scaleWidth(130)}px`;
    redBox.style.aspectRatio = "82 / 111";
    peepBoxes[8].appendChild(redBox);

    const redBox2 = document.createElement("div");
    redBox2.style.background = `url('${peep2}')`;
    redBox2.style.backgroundRepeat = "no-repeat";
    redBox2.style.backgroundSize = "contain";
    redBox2.style.backgroundPosition = "center center";
    redBox2.style.position = "absolute";
    redBox2.style.left = `${scaleWidth(97.5)}px`;
    redBox2.style.top = `${scaleWidth(0)}px`;
    redBox2.style.width = `${scaleWidth(130)}px`;
    redBox2.style.aspectRatio = "360 / 498";
    peepBoxes[5].appendChild(redBox2);

    const redBox3 = document.createElement("div");
    redBox3.style.background = `url('${peep3}')`;
    redBox3.style.backgroundRepeat = "no-repeat";
    redBox3.style.backgroundSize = "contain";
    redBox3.style.backgroundPosition = "center center";
    redBox3.style.position = "absolute";
    redBox3.style.left = `${scaleWidth(35)}px`;
    redBox3.style.width = `${scaleWidth(130)}px`;
    redBox3.style.transform = "translateX(-50%) rotate(2.5deg)";
    redBox3.style.top = `${scaleWidth(-65)}px`;
    redBox3.style.aspectRatio = "495 / 337";
    peepBoxes[6].appendChild(redBox3);

    const redBox4 = document.createElement("div");
    redBox4.style.background = `url('${peep4}')`;
    redBox4.style.backgroundRepeat = "no-repeat";
    redBox4.style.backgroundSize = "contain";
    redBox4.style.backgroundPosition = "center center";
    redBox4.style.position = "absolute";
    redBox4.style.left = `${scaleWidth(65)}px`;
    redBox4.style.top = `${scaleWidth(-45)}px`;
    redBox4.style.width = `${scaleWidth(130)}px`;
    redBox4.style.transform = "translateX(-50%)";
    redBox4.style.aspectRatio = "468 / 300";
    peepBoxes[2].appendChild(redBox4);

})
</script>
<template>
    <!--TODO: Center hero-header vertically, with cta-btn and hero-subtext below. Add "A project by Nikhil Singh" and "beta v 1.0" in top left, and scrolling-down chevron-down button in bottom right. And, obv, add peeps.-->
    <div class="hero-container">
        <RandomIconDrawer></RandomIconDrawer>
        <h1 class="hero-header">
          <span class="lead-in">Second Chapters,</span><br>
          <span class="hero-highlighted">Shared Books</span>
        </h1>
        <div class="cta-btn-container">
            <button class="cta-btn">Start Sharing</button>
        </div>
        <div class="subtext-container">
            <h3 class="hero-subtext">for <span class="subtext-highlighted">students</span>. by <span class="subtext-highlighted">students</span>.</h3>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.hero-container {
    position: relative;
    width: 100%;
    height: 100dvh;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(20, 1fr);
    text-align: center;    
    background-color: $color-background;

    .hero-header {
        grid-row: 5 / span 10;
        font-family: 'Manrope';
        text-align: center;
        line-height: 0.9;
        z-index: 5;
        color: $color-text;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .lead-in {
            font-size: px-to-vw(80);
        }
        .hero-highlighted {
            position: relative;
            font-size: clamp(2rem, 12vw, 30vh);            
            background: linear-gradient(to right, $color-primary, $color-accent);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            word-spacing: 50px;
        }
    }
    .cta-btn-container {
        display: flex;
        align-items: center;
        justify-content: center;
        grid-row: 15/16;
        .cta-btn {
            font-family: 'Nunito';
            svg {
                font-size: px-to-vw(40);
            }
            color: $color-text;
            border-radius: 14px;
            background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
            font-size: px-to-vw(20);
            padding: 1rem 2rem;
            cursor: pointer;
            border: 4px solid $color-background;
            transition: box-shadow 0.4s ease;
            &:hover {
                box-shadow: 0 0 0 4px $color-primary;
            }
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: 10px;
            position: relative;
            z-index: 4;
        }
    }

    .subtext-container {
        grid-row: 18/19;
        display: flex;
        align-items: center;
        justify-content: center;
        .hero-subtext {
            font-family: 'Matangi';
            font-weight: 350;
            letter-spacing: 3px;
            color: $color-text;
        }
        .subtext-highlighted {
            color: $color-primary;
            font-weight: 500;
        }
    }
}
</style>