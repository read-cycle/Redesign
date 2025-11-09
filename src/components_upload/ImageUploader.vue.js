/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
const props = defineProps({
    multiple: Boolean
});
const emit = defineEmits();
const fileInput = ref(null);
function openFilePicker() {
    fileInput.value?.click();
}
function onFileChange(event) {
    const target = event.target;
    const files = target.files;
    if (!files || files.length === 0) {
        emit('update:modelValue', props.multiple ? [] : null);
        return;
    }
    if (props.multiple) {
        emit('update:modelValue', Array.from(files));
    }
    else {
        emit('update:modelValue', files[0]);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['addFile']} */ ;
/** @type {__VLS_StyleScopedClasses['note']} */ ;
/** @type {__VLS_StyleScopedClasses['addFile']} */ ;
/** @type {__VLS_StyleScopedClasses['note']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-container']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uploader-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.onFileChange) },
    type: "file",
    ref: "fileInput",
    multiple: (props.multiple),
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inset-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uploader-image-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uploader-image" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "addFile" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "note" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uploader-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (__VLS_ctx.multiple) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ onClick: (__VLS_ctx.openFilePicker) },
    ...{ class: "browse-link" },
});
/** @type {__VLS_StyleScopedClasses['uploader-container']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-container']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-image']} */ ;
/** @type {__VLS_StyleScopedClasses['addFile']} */ ;
/** @type {__VLS_StyleScopedClasses['note']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader-text']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['browse-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            fileInput: fileInput,
            openFilePicker: openFilePicker,
            onFileChange: onFileChange,
        };
    },
    __typeEmits: {},
    props: {
        multiple: Boolean
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    props: {
        multiple: Boolean
    },
});
; /* PartiallyEnd: #4569/main.vue */
