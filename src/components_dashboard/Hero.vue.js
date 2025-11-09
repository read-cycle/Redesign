/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted } from 'vue';
import CTACard from './CTACard.vue';
import chats from '../assets/images/chats.svg';
import browse from '../assets/images/browse2.svg';
import upload from '../assets/images/scan.svg';
import router from '../router';
const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search2-icon lucide-file-search-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-icon lucide-message-square"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>'];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-para']} */ ;
/** @type {__VLS_StyleScopedClasses['card-track']} */ ;
/** @type {__VLS_StyleScopedClasses['cta']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-para']} */ ;
/** @type {__VLS_StyleScopedClasses['card-track']} */ ;
/** @type {__VLS_StyleScopedClasses['cta']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-para']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-para']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "cta-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "cta-para" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-track" },
});
/** @type {[typeof CTACard, typeof CTACard, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CTACard, new CTACard({
    ...{ 'onClick': {} },
    title: ('Browse Books'),
    icon: (__VLS_ctx.icons[0]),
    scenario: (__VLS_ctx.browse),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onClick': {} },
    title: ('Browse Books'),
    icon: (__VLS_ctx.icons[0]),
    scenario: (__VLS_ctx.browse),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/browser');
    }
};
var __VLS_2;
/** @type {[typeof CTACard, typeof CTACard, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(CTACard, new CTACard({
    ...{ 'onClick': {} },
    title: ('Upload Books'),
    icon: (__VLS_ctx.icons[1]),
    scenario: (__VLS_ctx.upload),
}));
const __VLS_8 = __VLS_7({
    ...{ 'onClick': {} },
    title: ('Upload Books'),
    icon: (__VLS_ctx.icons[1]),
    scenario: (__VLS_ctx.upload),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_10;
let __VLS_11;
let __VLS_12;
const __VLS_13 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/upload');
    }
};
var __VLS_9;
/** @type {[typeof CTACard, typeof CTACard, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(CTACard, new CTACard({
    ...{ 'onClick': {} },
    title: ('Chats'),
    icon: (__VLS_ctx.icons[2]),
    scenario: (__VLS_ctx.chats),
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClick': {} },
    title: ('Chats'),
    icon: (__VLS_ctx.icons[2]),
    scenario: (__VLS_ctx.chats),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_17;
let __VLS_18;
let __VLS_19;
const __VLS_20 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/chats');
    }
};
var __VLS_16;
/** @type {__VLS_StyleScopedClasses['cta']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-para']} */ ;
/** @type {__VLS_StyleScopedClasses['card-track']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CTACard: CTACard,
            chats: chats,
            browse: browse,
            upload: upload,
            router: router,
            icons: icons,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
