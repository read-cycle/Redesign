/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { signOut } from 'firebase/auth';
import logo from '../assets/icons/rc_logo.svg?raw';
import { auth } from '../firebase-init';
import router from '../router';
const logout = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    }
    catch (error) {
        console.error('Error signing out:', error);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "sidebar-items" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon sidebar-header-icon" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.logo) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "sidebar-text sidebar-header-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-layout-dashboard-icon lucide-layout-dashboard" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    width: "7",
    height: "9",
    x: "3",
    y: "3",
    rx: "1",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    width: "7",
    height: "5",
    x: "14",
    y: "3",
    rx: "1",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    width: "7",
    height: "9",
    x: "14",
    y: "12",
    rx: "1",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    width: "7",
    height: "5",
    x: "3",
    y: "16",
    rx: "1",
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/dashboard",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}));
const __VLS_2 = __VLS_1({
    to: "/dashboard",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-file-search2-icon lucide-file-search-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M14 2v4a2 2 0 0 0 2 2h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "11.5",
    cy: "14.5",
    r: "2.5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M13.3 16.3 15 18",
});
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/browser",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}));
const __VLS_6 = __VLS_5({
    to: "/browser",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-upload-icon lucide-upload" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M12 3v12",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m17 8-5-5-5 5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
});
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/upload",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}));
const __VLS_10 = __VLS_9({
    to: "/upload",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-message-square-icon lucide-message-square" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
});
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/chats",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}));
const __VLS_14 = __VLS_13({
    to: "/chats",
    ...{ class: "sidebar-text" },
    activeClass: "active-link",
    exact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "sidebar-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ onClick: (__VLS_ctx.logout) },
    ...{ class: "sidebar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "feather feather-log-out" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polyline, __VLS_intrinsicElements.polyline)({
    points: "16 17 21 12 16 7",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.line, __VLS_intrinsicElements.line)({
    x1: "21",
    y1: "12",
    x2: "9",
    y2: "12",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ class: "sidebar-text" },
});
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-items']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-layout-dashboard-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-layout-dashboard']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-file-search2-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-file-search-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-message-square-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-message-square']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feather']} */ ;
/** @type {__VLS_StyleScopedClasses['feather-log-out']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            logo: logo,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
