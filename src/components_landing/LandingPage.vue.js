/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import Hero from './Hero.vue';
import Navbar from './Navbar.vue';
import Abt from './Abt.vue';
import HIW from './HIW.vue';
import ContactUs from './ContactUs.vue';
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof Navbar, typeof Navbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Navbar, new Navbar({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-container" },
});
/** @type {[typeof Hero, typeof Hero, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(Hero, new Hero({}));
const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
/** @type {[typeof Abt, typeof Abt, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(Abt, new Abt({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {[typeof HIW, typeof HIW, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(HIW, new HIW({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {[typeof ContactUs, typeof ContactUs, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(ContactUs, new ContactUs({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {__VLS_StyleScopedClasses['page-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Hero: Hero,
            Navbar: Navbar,
            Abt: Abt,
            HIW: HIW,
            ContactUs: ContactUs,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
