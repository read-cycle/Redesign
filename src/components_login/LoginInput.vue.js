/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, defineEmits } from 'vue';
const emit = defineEmits();
const __VLS_props = defineProps();
const passwordHidden = ref(true);
const inputRef = ref(null);
function clearInput() {
    if (inputRef.value) {
        inputRef.value.value = "";
        emit('update:modelValue', "");
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.fieldset, __VLS_intrinsicElements.fieldset)({
    ...{ class: "input-box-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.legend, __VLS_intrinsicElements.legend)({});
(__VLS_ctx.fieldName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-icon-container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.fieldIcon) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:modelValue', $event.target.value);
        } },
    ref: "inputRef",
    type: (__VLS_ctx.isPassword ? (__VLS_ctx.passwordHidden ? 'password' : 'text') : 'text'),
    ...{ class: "input-box" },
    placeholder: (__VLS_ctx.placeholder),
    ...{ style: ({ marginRight: __VLS_ctx.isPassword ? '25%' : '15%' }) },
    value: (__VLS_ctx.modelValue),
});
/** @type {typeof __VLS_ctx.inputRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "optional-buttons" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.clearInput) },
    ...{ class: "optional-deleter" },
    ref: "optional-deleter",
});
/** @type {typeof __VLS_ctx['optional-deleter']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-x-icon lucide-x" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M18 6 6 18",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m6 6 12 12",
});
if (__VLS_ctx.isPassword) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isPassword))
                    return;
                __VLS_ctx.passwordHidden = !__VLS_ctx.passwordHidden;
            } },
        ...{ class: "optional-hider" },
    });
    if (__VLS_ctx.passwordHidden) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            ...{ class: "lucide lucide-eye-icon lucide-eye" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
            cx: "12",
            cy: "12",
            r: "3",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            ...{ class: "lucide lucide-eye-off-icon lucide-eye-off" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m2 2 20 20",
        });
    }
}
/** @type {__VLS_StyleScopedClasses['input-box-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['optional-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['optional-deleter']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['optional-hider']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-eye']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-eye-off-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-eye-off']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            passwordHidden: passwordHidden,
            inputRef: inputRef,
            clearInput: clearInput,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
