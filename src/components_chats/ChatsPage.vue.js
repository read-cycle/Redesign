/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import { nextTick, ref, watch } from 'vue';
import TableItem from './TableItem.vue';
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db, storage } from '../firebase-init';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import Navbar from '../components/Navbar.vue';
let userID = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        userID = user.uid;
        const matchedUploaderDocs = query(collection(db, 'matched'), where('uploaderID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(matchedUploaderDocs).then((result) => {
            uploaderDocsData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
        const matchedBuyerDocs = query(collection(db, 'matched'), where('buyerID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(matchedBuyerDocs).then((result) => {
            buyerDocsData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
    }
    else {
        router.push('/login');
    }
});
const uploaderDocsData = ref();
const buyerDocsData = ref();
function formatTime(ts) {
    if (!ts)
        return '';
    const date = 'toDate' in ts ? ts.toDate() : ts;
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0)
        hours = 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr}${ampm}`;
}
const inputData = ref(null);
const currentDoc = ref();
const messages = ref([]);
const displayItems = ref([]);
const unsub = ref();
watch(currentDoc, (newVal) => {
    if (!newVal)
        return;
    unsub.value = onSnapshot(query(collection(newVal[0], 'messages'), orderBy('timestamp', 'asc')), (snapshot) => {
        messages.value = snapshot.docs.map(x => x.data());
    });
});
async function sendMessage() {
    if (!currentDoc.value)
        return;
    if (!inputData.value && !fileInputRef.value?.files?.[0])
        return;
    console.log("SENDING");
    const [docRef, docData] = currentDoc.value;
    let baseRef = null;
    try {
        if (inputData.value)
            baseRef = await addDoc(collection(docRef, 'messages'), {
                text: inputData.value,
                sender: buyerDocsData.value?.includes(currentDoc.value) ? docData.buyerName : docData.uploaderName,
                timestamp: serverTimestamp(),
                type: 'text',
                senderID: userID
            });
        if (fileInputRef.value?.files?.[0]) {
            if (baseRef) {
                const listingImageRef = storageRef(storage, `matched/${docRef.id}/${baseRef.id}`);
                await uploadBytes(listingImageRef, fileInputRef.value.files[0]);
                const url = await getDownloadURL(listingImageRef);
                await updateDoc(baseRef, {
                    imageUrl: url,
                    type: 'text+image'
                });
            }
            else {
                const messageRef = await addDoc(collection(docRef, 'messages'), {
                    sender: buyerDocsData.value?.includes(currentDoc.value) ? docData.buyerName : docData.uploaderName,
                    timestamp: serverTimestamp(),
                    type: 'image',
                    senderID: userID
                });
                const listingImageRef = storageRef(storage, `matched/${docRef.id}/${messageRef.id}`);
                await uploadBytes(listingImageRef, fileInputRef.value.files[0]);
                const url = await getDownloadURL(listingImageRef);
                await updateDoc(messageRef, {
                    imageUrl: url
                });
            }
        }
        inputData.value = '';
        fileList.value = [];
        if (fileInputRef.value) {
            fileInputRef.value.value = '';
        }
    }
    catch (err) {
        console.error('Error sending message:', err);
    }
}
const isUserScrolling = ref(false);
function handleScroll() {
    if (!messagesContainer.value)
        return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
    isUserScrolling.value = scrollTop + clientHeight + 50 < scrollHeight;
}
const messagesContainer = ref(null);
watch(() => displayItems.value.length, async () => {
    await nextTick();
    if (!isUserScrolling.value && messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
});
const fileInputRef = ref(null);
function openFileDialog() {
    fileInputRef.value?.click();
}
const fileList = ref(null);
function handleFileChange(event) {
    const target = event.target;
    const file = target.files?.[0];
    if (file && target.files) {
        fileList.value = Array.from(target.files).map(x => URL.createObjectURL(x));
        console.log('Selected file:', file);
    }
}
watch(messages, (newVal) => {
    displayItems.value = [];
    newVal.forEach((msg, i) => {
        const currTs = msg.timestamp?.toMillis();
        const prevTs = i > 0 ? newVal[i - 1].timestamp?.toMillis() : null;
        if (currTs != null && prevTs != null && currTs - 8.64e7 > prevTs) {
            displayItems.value.push({
                type: 'daymarker',
                dayMarker: {
                    text: msg.timestamp.toDate().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })
                }
            });
        }
        if (i === 0) {
            const dateText = msg.timestamp
                ? msg.timestamp.toDate().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : 'Unknown Date';
            displayItems.value.push({ type: 'daymarker', dayMarker: { text: dateText } });
        }
        displayItems.value.push({ type: 'message', message: msg });
    });
});
function getTimestampMillis(msg) {
    return msg?.timestamp?.toMillis() ?? null;
}
function showAuthorTimeBox(i) {
    const item = displayItems.value[i];
    const prev = displayItems.value[i - 1];
    const currTs = getTimestampMillis(item?.message);
    const prevTs = getTimestampMillis(prev?.message);
    if (i === 1)
        return true;
    if (!currTs || !prevTs)
        return false;
    if (prev?.message?.senderID !== item?.message?.senderID)
        return true;
    return currTs - prevTs > 5 * 60 * 1000;
}
const toggleConfirmationModal = ref(false);
const selectedNotif = ref(null);
function openModal(item) {
    selectedNotif.value = item;
    toggleConfirmationModal.value = true;
    window.scrollY = 0;
    document.body.style.overflow = "hidden";
}
const possibleStates = [
    ['Accepted', success],
    ['Denied', failure]
];
const activeState = ref(null);
async function acceptRequest() {
    if (!selectedNotif.value)
        return;
    const [docRef, data] = selectedNotif.value;
    try {
        const matchedRef = doc(db, "matched", docRef.id);
        await setDoc(matchedRef, data);
        await deleteDoc(docRef);
        console.log(`Moved ${docRef.id} from buyerRequested → matched`);
    }
    catch (err) {
        console.error("Error accepting request:", err);
    }
}
async function denyRequest() {
    if (!selectedNotif.value)
        return;
    const [docRef] = selectedNotif.value;
    try {
        await deleteDoc(docRef);
        console.log(`Deleted ${docRef.id} from buyerRequested`);
    }
    catch (err) {
        console.error("Error denying request:", err);
    }
}
function closeConfirmationModal() {
    toggleConfirmationModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-container-1']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-container-2']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container-1']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof Sidebar, typeof Sidebar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Sidebar, new Sidebar({
    ...{ class: "sidebar" },
}));
const __VLS_1 = __VLS_0({
    ...{ class: "sidebar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof Navbar, typeof Navbar, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(Navbar, new Navbar({
    ...{ class: "navbar" },
}));
const __VLS_4 = __VLS_3({
    ...{ class: "navbar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metabar-container" },
});
/** @type {[typeof MetaBar, typeof MetaBar, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(MetaBar, new MetaBar({
    ...{ 'onNotifClick': {} },
    title: ('Chats'),
    ref: "metaBar",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onNotifClick': {} },
    title: ('Chats'),
    ref: "metaBar",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
let __VLS_11;
const __VLS_12 = {
    onNotifClick: (__VLS_ctx.openModal)
};
/** @type {typeof __VLS_ctx.metaBar} */ ;
var __VLS_13 = {};
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container chats-container-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-icon-side-chat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-hand-coins-icon lucide-hand-coins" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m2 16 6 6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "16",
    cy: "9",
    r: "2.9",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "6",
    cy: "5",
    r: "3",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-text-side-chat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-data" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-list" },
});
for (const [doc] of __VLS_getVForSourceType((__VLS_ctx.uploaderDocsData))) {
    /** @type {[typeof TableItem, typeof TableItem, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(TableItem, new TableItem({
        ...{ 'onClick': {} },
        uploader: (true),
        docData: (doc),
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        uploader: (true),
        docData: (doc),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_18;
    let __VLS_19;
    let __VLS_20;
    const __VLS_21 = {
        onClick: (...[$event]) => {
            __VLS_ctx.currentDoc = doc;
        }
    };
    var __VLS_17;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container chats-container-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-icon-side-chat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-file-search-icon lucide-file-search" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M14 2v4a2 2 0 0 0 2 2h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m9 18-1.5-1.5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "5",
    cy: "14",
    r: "3",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-text-side-chat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-data" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-list" },
});
for (const [doc] of __VLS_getVForSourceType((__VLS_ctx.buyerDocsData))) {
    /** @type {[typeof TableItem, typeof TableItem, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(TableItem, new TableItem({
        ...{ 'onClick': {} },
        uploader: (false),
        docData: (doc),
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onClick': {} },
        uploader: (false),
        docData: (doc),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_25;
    let __VLS_26;
    let __VLS_27;
    const __VLS_28 = {
        onClick: (...[$event]) => {
            __VLS_ctx.currentDoc = doc;
        }
    };
    var __VLS_24;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container main-container-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header chat-header" },
});
if (__VLS_ctx.currentDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
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
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-text-container" },
});
if (__VLS_ctx.currentDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.currentDoc?.[1].title?.name);
}
if (__VLS_ctx.currentDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.currentDoc?.[1].uploaderName);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header-text-container right-text-container" },
});
if (__VLS_ctx.currentDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-graduation-cap-icon lucide-graduation-cap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M22 10v6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-text" },
    });
    (__VLS_ctx.currentDoc?.[1].grade?.name);
}
if (__VLS_ctx.currentDoc) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-piggy-bank-icon lucide-piggy-bank" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M16 10h.01",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M2 8v1a2 2 0 0 0 2 2h1",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metadata-text" },
    });
    (__VLS_ctx.currentDoc?.[1].price);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-data" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onScroll: (__VLS_ctx.handleScroll) },
    ...{ class: "messages-wrapper" },
    ref: "messagesContainer",
});
/** @type {typeof __VLS_ctx.messagesContainer} */ ;
for (const [item, i] of __VLS_getVForSourceType((__VLS_ctx.displayItems))) {
    if (item.type == 'daymarker') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "day-marker" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.dayMarker?.text);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
    }
    if (item.type == 'message') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message" },
            ...{ class: ({ 'message-me': item.message?.senderID == __VLS_ctx.userID, 'message-other': item.message?.senderID != __VLS_ctx.userID }) },
        });
        if (__VLS_ctx.showAuthorTimeBox(i)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "author-time-box" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "author-box" },
            });
            (item.message?.sender);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "time-box" },
            });
            (item.message?.timestamp ? __VLS_ctx.formatTime(item.message.timestamp) : '');
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message-content" },
        });
        if (item.message?.imageUrl) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-image-container" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
                src: (item.message?.imageUrl),
            });
        }
        if (item.message?.text) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-text-container" },
            });
            (item.message?.text);
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-wrapper" },
    ...{ style: ({ height: __VLS_ctx.fileList != undefined && __VLS_ctx.fileList?.length > 0 ? '20%' : '10%' }) },
});
if (__VLS_ctx.fileList != undefined && __VLS_ctx.fileList?.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "files-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "files-wrapper" },
    });
    for (const [file, i] of __VLS_getVForSourceType((__VLS_ctx.fileList))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-item" },
            ...{ style: ({ backgroundImage: `url(${file})` }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.fileList != undefined && __VLS_ctx.fileList?.length > 0))
                        return;
                    __VLS_ctx.fileList?.splice(i, 1);
                } },
            ...{ class: "cross-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            ...{ class: "lucide lucide-circle-x-icon lucide-circle-x" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m15 9-6 6",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m9 9 6 6",
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-internal-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-box" },
    ref: "inputBox",
});
/** @type {typeof __VLS_ctx.inputBox} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onKeyup: (__VLS_ctx.sendMessage) },
    type: "text",
    placeholder: "Write something...",
    value: (__VLS_ctx.inputData),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "dim-btn emoji-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-smile-plus-icon lucide-smile-plus" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M22 11v1a10 10 0 1 1-9-10",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M8 14s1.5 2 4 2 4-2 4-2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
    x1: "9",
    x2: "9.01",
    y1: "9",
    y2: "9",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
    x1: "15",
    x2: "15.01",
    y1: "9",
    y2: "9",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M16 5h6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M19 2v6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileChange) },
    type: "file",
    ...{ class: "attachment-file-input" },
    ref: "fileInputRef",
});
/** @type {typeof __VLS_ctx.fileInputRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openFileDialog) },
    ...{ class: "dim-btn attachment-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-paperclip-icon lucide-paperclip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-btn" },
    ref: "sendBtn",
});
/** @type {typeof __VLS_ctx.sendBtn} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.sendMessage();
        } },
    ...{ class: "send-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-send-icon lucide-send" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m21.854 2.147-10.94 10.939",
});
if (__VLS_ctx.toggleConfirmationModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-confirmation-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-confirmation-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleConfirmationModal))
                    return;
                __VLS_ctx.closeConfirmationModal();
            } },
        ...{ class: "close-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-half" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "confirm-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "book-metadata" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1]?.title?.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1]?.grade?.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "requester-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1]?.buyerName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1].shareBuyerLocation ? __VLS_ctx.selectedNotif?.[1].buyerLocation : "Not Shared");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1].buyerContactPreference.map(x => x.name).join(', '));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1].buyerDeliveryPreference.map(x => x.name).join(', '));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.selectedNotif?.[1].buyerQuantity);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "button-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleConfirmationModal))
                    return;
                __VLS_ctx.activeState = __VLS_ctx.possibleStates[0];
                __VLS_ctx.acceptRequest();
            } },
        ...{ class: "accept-btn" },
        disabled: (__VLS_ctx.activeState?.[0] != null),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleConfirmationModal))
                    return;
                __VLS_ctx.activeState = __VLS_ctx.possibleStates[1];
                __VLS_ctx.denyRequest();
            } },
        ...{ class: "deny-btn" },
        disabled: (__VLS_ctx.activeState?.[0] != null),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "image-half" },
    });
    const __VLS_29 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        name: "fade-in",
    }));
    const __VLS_31 = __VLS_30({
        name: "fade-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    if (__VLS_ctx.activeState !== null) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state-container" },
        });
        if (__VLS_ctx.activeState !== null) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "icon-container" },
                ...{ style: ({ color: __VLS_ctx.activeState?.[0] == 'Accepted' ? '#26e5bc' : '#ff9b9b' }) },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeState?.[1]) }, null, null);
        }
    }
    var __VLS_32;
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-container-1']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-hand-coins-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-hand-coins']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['table-data']} */ ;
/** @type {__VLS_StyleScopedClasses['table-list']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chats-container-2']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-icon-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-file-search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-file-search']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-side-chat']} */ ;
/** @type {__VLS_StyleScopedClasses['table-data']} */ ;
/** @type {__VLS_StyleScopedClasses['table-list']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container-1']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-binary-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-binary']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['right-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-graduation-cap-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-graduation-cap']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-text']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-piggy-bank-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-piggy-bank']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-text']} */ ;
/** @type {__VLS_StyleScopedClasses['table-data']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['day-marker']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-me']} */ ;
/** @type {__VLS_StyleScopedClasses['message-other']} */ ;
/** @type {__VLS_StyleScopedClasses['author-time-box']} */ ;
/** @type {__VLS_StyleScopedClasses['author-box']} */ ;
/** @type {__VLS_StyleScopedClasses['time-box']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['files-track']} */ ;
/** @type {__VLS_StyleScopedClasses['files-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['cross-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-circle-x-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-circle-x']} */ ;
/** @type {__VLS_StyleScopedClasses['input-internal-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['input-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['input-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dim-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['emoji-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-smile-plus-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-smile-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['input-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['attachment-file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['dim-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['attachment-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-paperclip-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-paperclip']} */ ;
/** @type {__VLS_StyleScopedClasses['input-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-send-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-send']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-confirmation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-confirmation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['text-half']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['accept-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['deny-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['state-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
// @ts-ignore
var __VLS_14 = __VLS_13;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Sidebar: Sidebar,
            MetaBar: MetaBar,
            TableItem: TableItem,
            Navbar: Navbar,
            userID: userID,
            uploaderDocsData: uploaderDocsData,
            buyerDocsData: buyerDocsData,
            formatTime: formatTime,
            inputData: inputData,
            currentDoc: currentDoc,
            displayItems: displayItems,
            sendMessage: sendMessage,
            handleScroll: handleScroll,
            messagesContainer: messagesContainer,
            fileInputRef: fileInputRef,
            openFileDialog: openFileDialog,
            fileList: fileList,
            handleFileChange: handleFileChange,
            showAuthorTimeBox: showAuthorTimeBox,
            toggleConfirmationModal: toggleConfirmationModal,
            selectedNotif: selectedNotif,
            openModal: openModal,
            possibleStates: possibleStates,
            activeState: activeState,
            acceptRequest: acceptRequest,
            denyRequest: denyRequest,
            closeConfirmationModal: closeConfirmationModal,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
