/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
const __VLS_props = defineProps({
    title: String,
    icon: String,
    scenario: String
});
const ctaCard = ref(null);
onMounted(() => {
    if (!ctaCard.value)
        return;
    ctaCard.value.style.width = '100%';
    ctaCard.value.style.height = '100%';
    const { width, height } = ctaCard.value.getBoundingClientRect();
    if (height > width) {
        ctaCard.value.style.height = 'auto';
        ctaCard.value.style.width = '100%';
    }
    else {
        ctaCard.value.style.width = 'auto';
        ctaCard.value.style.height = '100%';
    }
    ctaCard.value.style.aspectRatio = '1/1';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cta-card-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cta-card" },
    ref: "ctaCard",
});
/** @type {typeof __VLS_ctx.ctaCard} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "background-scenario" },
    ...{ style: ({ backgroundImage: `url(${__VLS_ctx.scenario})` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.icon) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.title);
/** @type {__VLS_StyleScopedClasses['cta-card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['background-scenario']} */ ;
/** @type {__VLS_StyleScopedClasses['card-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ctaCard: ctaCard,
        };
    },
    props: {
        title: String,
        icon: String,
        scenario: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        title: String,
        icon: String,
        scenario: String
    },
});
; /* PartiallyEnd: #4569/main.vue */
