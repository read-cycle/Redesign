/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { nextTick, onMounted, ref } from 'vue';
import { random_icons } from '../mappings';
const concurrentDrawingIcons = 5;
const iconPositions = ref(Array.from({ length: concurrentDrawingIcons }, () => ({ top: '0px', left: '0px', icon: "" })));
onMounted(() => {
    const container = document.querySelector(".random-container");
    const contWidth = container.clientWidth;
    const contHeight = container.clientHeight;
    const cellSize = contWidth / 40;
    const cellsX = 40;
    const cellsY = Math.floor(contHeight / cellSize);
    const usedPositions = new Set();
    const usedIndexes = new Set();
    function getUniqueIconIndex() {
        if (usedIndexes.size === random_icons.length)
            usedIndexes.clear();
        let idx = Math.floor(Math.random() * random_icons.length);
        while (usedIndexes.has(idx)) {
            idx = Math.floor(Math.random() * random_icons.length);
        }
        usedIndexes.add(idx);
        return idx;
    }
    const getRandomCellData = () => {
        if (usedPositions.size >= cellsX * cellsY)
            usedPositions.clear();
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
        }, 12000 + Math.random() * 5000);
    }
    nextTick(() => {
        document.querySelectorAll('svg > *').forEach((el) => {
            const length = el.getTotalLength();
            el.style.strokeDasharray = length.toString();
            el.style.strokeDashoffset = length.toString();
        });
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "random-container" },
});
for (const [data, i] of __VLS_getVForSourceType((__VLS_ctx.iconPositions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (i + '-' + data.icon),
        ...{ class: "icon-container" },
        ...{ style: ({ top: data.top, left: data.left }) },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (data.icon) }, null, null);
}
/** @type {__VLS_StyleScopedClasses['random-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            iconPositions: iconPositions,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
