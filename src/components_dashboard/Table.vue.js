/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onAuthStateChanged } from 'firebase/auth';
import TableItem from './TableItem.vue';
import { auth, db } from '../firebase-init';
import router from '../router';
import { collection, deleteDoc, DocumentReference, getDocs, orderBy, query, where } from 'firebase/firestore';
import { ref } from 'vue';
const props = defineProps({
    header: String,
    icon: String,
    tableType: String
});
let userID = null;
const docsData = ref([]);
onAuthStateChanged(auth, (user) => {
    if (user) {
        userID = user.uid;
        if (props.tableType == 'listings') {
            const uploadDocs = query(collection(db, 'uploadPool'), where('uploaderID', '==', userID), orderBy('timestamp', 'desc'));
            getDocs(uploadDocs).then((result) => {
                console.log(result);
                docsData.value = result.docs.map((doc) => {
                    const data = doc.data();
                    return [doc.ref, { id: doc.id, ...data }];
                });
            });
        }
        else {
            const uploadDocs = query(collection(db, 'watchlist'), where('buyerID', '==', userID), orderBy('timestamp', 'desc'));
            getDocs(uploadDocs).then((result) => {
                docsData.value = result.docs.map((doc) => {
                    const data = doc.data();
                    return [doc.ref, { id: doc.id, ...data }];
                });
            });
        }
    }
    else {
        router.push('/login');
    }
});
function handleDelete(docRef) {
    deleteDoc(docRef)
        .then(() => {
        docsData.value = docsData.value.filter(d => d[0].id !== docRef.id);
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['add-watchlist']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['add-watchlist']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['add-watchlist']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['add-watchlist']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-icon" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.icon) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "table-header-text" },
});
(__VLS_ctx.header);
if (__VLS_ctx.tableType === 'watchlist') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.tableType === 'watchlist'))
                    return;
                __VLS_ctx.$emit('watchlist-click');
            } },
        ...{ class: "add-watchlist" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-plus-icon lucide-plus" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M5 12h14",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M12 5v14",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "options-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "search-input" },
    placeholder: "Search...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "option-btn-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-arrow-down-narrow-wide-icon lucide-arrow-down-narrow-wide" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m3 16 4 4 4-4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M7 20V4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 4h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 8h7",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 12h10",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "option-btn-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-funnel-icon lucide-funnel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-data" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "table-list" },
});
for (const [doc] of __VLS_getVForSourceType((__VLS_ctx.docsData))) {
    /** @type {[typeof TableItem, typeof TableItem, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(TableItem, new TableItem({
        ...{ 'onDelete': {} },
        doc: (doc),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onDelete': {} },
        doc: (doc),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onDelete: (__VLS_ctx.handleDelete)
    };
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text']} */ ;
/** @type {__VLS_StyleScopedClasses['add-watchlist']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-plus-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['options-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-arrow-down-narrow-wide-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-arrow-down-narrow-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-funnel-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-funnel']} */ ;
/** @type {__VLS_StyleScopedClasses['table-data']} */ ;
/** @type {__VLS_StyleScopedClasses['table-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TableItem: TableItem,
            docsData: docsData,
            handleDelete: handleDelete,
        };
    },
    props: {
        header: String,
        icon: String,
        tableType: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        header: String,
        icon: String,
        tableType: String
    },
});
; /* PartiallyEnd: #4569/main.vue */
