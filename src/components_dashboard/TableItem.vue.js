/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { DocumentReference, Timestamp } from 'firebase/firestore';
const props = defineProps();
const emit = defineEmits(["delete"]);
function formatTimestampToDDMMYY(timestamp) {
    const date = timestamp.toDate();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}
function deleteDoc() {
    emit("delete", props.doc[0]);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-grade']} */ ;
/** @type {__VLS_StyleScopedClasses['item-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-grade']} */ ;
/** @type {__VLS_StyleScopedClasses['item-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-grade']} */ ;
/** @type {__VLS_StyleScopedClasses['item-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-grade']} */ ;
/** @type {__VLS_StyleScopedClasses['item-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "table-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-binary-icon lucide-binary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    x: "14",
    y: "14",
    width: "4",
    height: "6",
    rx: "2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    x: "6",
    y: "4",
    width: "4",
    height: "6",
    rx: "2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M6 20h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M14 10h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M6 14h2v6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M14 4h2v6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "item-header" },
});
(props.doc[1].title?.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "item-grade" },
});
(props.doc[1].grade?.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-options" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.deleteDoc) },
    ...{ class: "delete-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-trash-icon lucide-trash" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M3 6h18",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-metadata" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
(__VLS_ctx.formatTimestampToDDMMYY(props.doc[1].timestamp));
/** @type {__VLS_StyleScopedClasses['table-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-binary-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-binary']} */ ;
/** @type {__VLS_StyleScopedClasses['item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-grade']} */ ;
/** @type {__VLS_StyleScopedClasses['item-options']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash']} */ ;
/** @type {__VLS_StyleScopedClasses['item-metadata']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatTimestampToDDMMYY: formatTimestampToDDMMYY,
            deleteDoc: deleteDoc,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
