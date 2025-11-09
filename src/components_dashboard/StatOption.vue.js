/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, ref } from 'vue';
const __VLS_props = defineProps({
    header: String,
    text: String,
    icon: String
});
const optionContainer = ref(null);
onMounted(() => {
    if (!optionContainer.value)
        return;
    optionContainer.value.style.width = '100%';
    optionContainer.value.style.height = '100%';
    const { width, height } = optionContainer.value.getBoundingClientRect();
    if (height > width) {
        optionContainer.value.style.height = 'auto';
        optionContainer.value.style.width = '100%';
    }
    else {
        optionContainer.value.style.width = 'auto';
        optionContainer.value.style.height = '100%';
    }
    optionContainer.value.style.aspectRatio = '1/1';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-text']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-text']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-text']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-option" },
    ref: "optionContainer",
});
/** @type {typeof __VLS_ctx.optionContainer} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.icon) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "stat-container-header" },
});
(__VLS_ctx.header);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "stat-container-text" },
});
(__VLS_ctx.text);
/** @type {__VLS_StyleScopedClasses['stat-option']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            optionContainer: optionContainer,
        };
    },
    props: {
        header: String,
        text: String,
        icon: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        header: String,
        text: String,
        icon: String
    },
});
; /* PartiallyEnd: #4569/main.vue */
