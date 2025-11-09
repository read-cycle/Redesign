/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
const isCooldown = ref(false);
const delta = ref(0);
const currentSlide = ref(0);
const containerRef = ref(null);
function isInScrollZone() {
    const el = containerRef.value;
    if (!el)
        return false;
    const rect = el.getBoundingClientRect();
    const tolerance = 50; // allows ~5px leeway
    return (Math.abs(rect.top) <= tolerance &&
        Math.abs(rect.bottom - window.innerHeight) <= tolerance);
}
onMounted(() => {
    window.addEventListener("wheel", (e) => {
        if (!isInScrollZone() || isCooldown.value)
            return;
        const deltaY = e.deltaY;
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hiw-container" },
    ref: "containerRef",
    id: "how-it-works",
});
/** @type {typeof __VLS_ctx.containerRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-container" },
    ...{ style: ({ transform: `translateY(-${__VLS_ctx.currentSlide * 25}%)` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vertical-indicator" },
});
for (const [n] of __VLS_getVForSourceType((4))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (n),
        ...{ class: "dot" },
        ...{ class: ('dot-' + n) },
        ...{ style: ({ top: (25 * (n - 1) + 9.5) + '%' }) },
    });
    (n);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vertical-indicator-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide slide-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide slide-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide slide-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide slide-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
/** @type {__VLS_StyleScopedClasses['hiw-container']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-indicator-line']} */ ;
/** @type {__VLS_StyleScopedClasses['slide']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-1']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-2']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-3']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slide']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-4']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            currentSlide: currentSlide,
            containerRef: containerRef,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
