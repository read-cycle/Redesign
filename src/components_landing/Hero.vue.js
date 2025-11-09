/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted } from 'vue';
import { manropeGlyphData } from '../mappings';
import peep1 from '@/assets/images/peep-1.svg';
import peep2 from '@/assets/images/peep-2.svg';
import peep3 from '@/assets/images/peep-3.svg';
import peep4 from '@/assets/images/peep-4.svg';
import RandomIconDrawer from './RandomIconDrawer.vue';
function getGlyphBox(el, letterIndex) {
    const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
    let total = 0;
    for (const node of textNodes) {
        const len = node.textContent?.length ?? 0;
        if (letterIndex < total + len) {
            const range = document.createRange();
            range.setStart(node, letterIndex - total);
            range.setEnd(node, letterIndex - total + 1);
            return range.getBoundingClientRect();
        }
        total += len;
    }
    return null;
}
function getManropeOGlyphMetrics(char, fontSizePx, lineIndex = 0, lineHeight = 0.9) {
    const scaleWidth = (basePx) => (basePx / 1920) * window.innerWidth;
    const unitsPerEm = 2000;
    const glyph = manropeGlyphData[char];
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
const glyphIndices = [2, 5, 7, 9];
onMounted(async () => {
    await document.fonts.ready;
    const highlightedText = document.querySelector(".hero-highlighted");
    const content = highlightedText.textContent ?? '';
    let peepBoxes = [];
    console.log(content);
    for (let i = 0; i < glyphIndices.length; i++) {
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
    const scaleWidth = (basePx) => (basePx / 1920) * window.innerWidth;
    const redBox = document.createElement("div");
    redBox.className = 'peep-1-box';
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
    peepBoxes[3].appendChild(redBox);
    const redBox2 = document.createElement("div");
    redBox2.className = 'peep-2-box';
    redBox2.style.background = `url('${peep2}')`;
    redBox2.style.backgroundRepeat = "no-repeat";
    redBox2.style.backgroundSize = "contain";
    redBox2.style.backgroundPosition = "center center";
    redBox2.style.position = "absolute";
    redBox2.style.left = `${scaleWidth(97.5)}px`;
    redBox2.style.top = `${scaleWidth(0)}px`;
    redBox2.style.width = `${scaleWidth(130)}px`;
    redBox2.style.aspectRatio = "360 / 498";
    peepBoxes[1].appendChild(redBox2);
    const redBox3 = document.createElement("div");
    redBox3.className = 'peep-3-box';
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
    peepBoxes[2].appendChild(redBox3);
    const redBox4 = document.createElement("div");
    redBox4.className = 'peep-4-box';
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
    peepBoxes[0].appendChild(redBox4);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cta-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-highlighted']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-break']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-container" },
});
/** @type {[typeof RandomIconDrawer, typeof RandomIconDrawer, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(RandomIconDrawer, new RandomIconDrawer({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "hero-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "lead-in" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hero-highlighted" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({
    ...{ class: "mobile-break" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cta-btn-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "cta-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "subtext-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "hero-subtext" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "subtext-highlighted" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "subtext-highlighted" },
});
/** @type {__VLS_StyleScopedClasses['hero-container']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-header']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-in']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-highlighted']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-break']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['subtext-container']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['subtext-highlighted']} */ ;
/** @type {__VLS_StyleScopedClasses['subtext-highlighted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RandomIconDrawer: RandomIconDrawer,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
