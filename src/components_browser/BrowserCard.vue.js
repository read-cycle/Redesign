/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import Tag from './Tag.vue';
const props = defineProps();
function formatTimestampToDDMMYY(ts) {
    const date = ts.toDate();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-container browsercard-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "image-container" },
    ...{ style: ({ backgroundImage: `url(${__VLS_ctx.data.listingImage})` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-text-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-container-header" },
});
(props.data.title?.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-container-para" },
});
(props.data.grade?.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metadata-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.formatTimestampToDDMMYY(props.data.timestamp));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tags-container" },
});
for (const [tag, i] of __VLS_getVForSourceType((props.data.tags))) {
    /** @type {[typeof Tag, typeof Tag, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Tag, new Tag({
        key: (i),
        text: (tag.name),
    }));
    const __VLS_1 = __VLS_0({
        key: (i),
        text: (tag.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['browsercard-container']} */ ;
/** @type {__VLS_StyleScopedClasses['image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-para']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Tag: Tag,
            formatTimestampToDDMMYY: formatTimestampToDDMMYY,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
