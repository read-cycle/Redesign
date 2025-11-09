/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { query, collection, orderBy, DocumentReference, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../firebase-init';
import bell from '../assets/icons/bell.svg?raw';
import bellDot from '../assets/icons/bell-dot.svg?raw';
import { updateProfile, onAuthStateChanged, updatePassword, linkWithPopup, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, OAuthProvider, deleteUser } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import router from '../router';
import Multiselect from 'vue-multiselect';
let userID = null;
let userName = null;
let userEmail = null;
const docsData = ref([]);
onAuthStateChanged(auth, (user) => {
    if (user) {
        userID = user.uid;
        userEmail = user.email;
        userName = user.displayName;
        googleLinkedEmail.value = user.providerData.find(x => x.providerId == 'google.com')?.email;
        facebookLinkedEmail.value = user.providerData.find(x => x.providerId == 'facebook.com')?.email;
        twitterLinkedEmail.value = user.providerData.find(x => x.providerId == 'twitter.com')?.email;
        microsoftLinkedEmail.value = user.providerData.find(x => x.providerId == 'microsoft.com')?.email;
        const uploadDocs = query(collection(db, 'buyerRequested'), where('uploaderID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(uploadDocs).then((result) => {
            docsData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
    }
    else {
        router.push('/login');
    }
});
const __VLS_props = defineProps({
    title: String
});
const googleLinkedEmail = ref();
const facebookLinkedEmail = ref();
const twitterLinkedEmail = ref();
const microsoftLinkedEmail = ref();
const showNotifs = ref(false);
const notifsBtn = ref(null);
const iconHtml = computed(() => docsData.value.length >= 1 ? bellDot : bell);
const toggleSettingsModal = ref(false);
const selectedSettingOption = ref('account');
const contactPreferenceOptions = [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }];
const contactPreference = ref([]);
const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }];
const deliveryPreference = ref([]);
const newPassword = ref('');
async function deleteAccount() {
    if (!auth.currentUser)
        return;
    const confirmed = window.confirm(`Are you sure you want to delete your account ${userEmail}? This action cannot be undone.`);
    if (!confirmed)
        return;
    try {
        await deleteUser(auth.currentUser);
        alert("Your account has been deleted.");
        router.push('/login');
    }
    catch (error) {
        if (error.code === "auth/requires-recent-login") {
            alert("Please re-authenticate before deleting your account.");
            router.push('/login');
        }
        else {
            console.error(error);
            alert(`Error deleting account: ${error.message}`);
        }
    }
}
async function resetPassword() {
    try {
        if (!userEmail) {
            return;
        }
        if (auth.currentUser) {
            await updatePassword(auth.currentUser, newPassword.value);
            alert('Password changed!');
        }
    }
    catch (error) {
        if (error.code === "auth/requires-recent-login") {
            alert("Please re-authenticate before changing your password.");
            router.push('/login');
        }
        else {
            console.error(error);
            alert(`Error deleting account: ${error.message}`);
        }
    }
}
async function linkGoogleAccount() {
    if (!auth.currentUser)
        return;
    const provider = new GoogleAuthProvider();
    try {
        const result = await linkWithPopup(auth.currentUser, provider);
        console.log("Linked provider:", result.user.providerData);
    }
    catch (error) {
        if (error.code === "auth/credential-already-in-use") {
            alert("That Google account is already linked with another user.");
        }
        else {
            console.error(error);
        }
    }
}
async function linkMetaAccount() {
    if (!auth.currentUser)
        return;
    const provider = new FacebookAuthProvider();
    try {
        const result = await linkWithPopup(auth.currentUser, provider);
        console.log("Linked provider:", result.user.providerData);
    }
    catch (error) {
        if (error.code === "auth/credential-already-in-use") {
            alert("That Meta account is already linked with another user.");
        }
        else {
            console.error(error);
        }
    }
}
async function linkTwitterAccount() {
    if (!auth.currentUser)
        return;
    const provider = new TwitterAuthProvider();
    try {
        const result = await linkWithPopup(auth.currentUser, provider);
        console.log("Linked provider:", result.user.providerData);
    }
    catch (error) {
        if (error.code === "auth/credential-already-in-use") {
            alert("That Twitter/X account is already linked with another user.");
        }
        else {
            console.error(error);
        }
    }
}
async function linkMicrosoftAccount() {
    if (!auth.currentUser)
        return;
    const provider = new OAuthProvider('microsoft.com');
    try {
        const result = await linkWithPopup(auth.currentUser, provider);
        console.log("Linked provider:", result.user.providerData);
    }
    catch (error) {
        if (error.code === "auth/credential-already-in-use") {
            alert("That Microsoft account is already linked with another user.");
        }
        else {
            console.error(error);
        }
    }
}
const newDisplayName = ref('');
async function changeDisplayName() {
    if (!auth.currentUser)
        return;
    try {
        await updateProfile(auth.currentUser, { displayName: newDisplayName.value });
        alert("Display name updated!");
        console.log("New name:", auth.currentUser.displayName);
    }
    catch (error) {
        console.error("Error updating display name:", error);
        alert(`Error: ${error.message}`);
    }
}
async function changeContactPreference() {
    if (!userID)
        return;
    if (!auth.currentUser)
        return;
    try {
        await setDoc(doc(db, "users", userID), { contactPreferences: contactPreference.value }, { merge: true });
        alert("Contact Preferences updated!");
    }
    catch (error) {
        console.error("Error updating contact preferences:", error);
        alert(`Error: ${error.message}`);
    }
}
async function changeDeliveryPreference() {
    if (!userID)
        return;
    if (!auth.currentUser)
        return;
    try {
        await setDoc(doc(db, "users", userID), { deliveryPreferences: deliveryPreference.value }, { merge: true });
        alert("Delivery Preferences updated!");
    }
    catch (error) {
        console.error("Error updating delivery preferences:", error);
        alert(`Error: ${error.message}`);
    }
}
const windowWidth = ref(window.innerWidth);
function openSettingsModal() {
    toggleSettingsModal.value = true;
    window.scrollY = 0;
    document.body.style.overflow = "hidden";
}
function closeSettingsModal() {
    toggleSettingsModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
function useTeleportDropdown(el) {
    let dropdown = null;
    const observer = new MutationObserver(() => {
        const found = el.querySelector(".multiselect__content-wrapper");
        if (found && found !== dropdown) {
            dropdown = found;
            document.body.appendChild(dropdown);
            positionDropdown();
        }
    });
    const positionDropdown = () => {
        if (!dropdown)
            return;
        const rect = el.getBoundingClientRect();
        dropdown.style.position = "absolute";
        dropdown.style.top = rect.bottom + "px";
        dropdown.style.left = rect.left + "px";
        dropdown.style.width = rect.width + "px";
        dropdown.style.zIndex = "9999999";
    };
    const cleanup = () => {
        observer.disconnect();
        if (dropdown)
            dropdown.remove();
    };
    observer.observe(el, { childList: true, subtree: true });
    window.addEventListener("resize", positionDropdown);
    window.addEventListener("scroll", positionDropdown, true);
    return cleanup;
}
onMounted(() => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement && node.classList.contains("multiselect")) {
                    console.log("NEW MULTISELECT: ", node);
                    const cleanup = useTeleportDropdown(node);
                    onBeforeUnmount(cleanup);
                }
                if (node instanceof HTMLElement) {
                    node.querySelectorAll(".multiselect").forEach(el => {
                        console.log("NEW MULTISELECT (child): ", el);
                        const cleanup = useTeleportDropdown(el);
                        onBeforeUnmount(cleanup);
                    });
                }
            });
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    document.querySelectorAll(".multiselect").forEach(el => {
        const cleanup = useTeleportDropdown(el);
        onBeforeUnmount(cleanup);
    });
    onBeforeUnmount(() => observer.disconnect());
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['notifications-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['title-label']} */ ;
/** @type {__VLS_StyleScopedClasses['grade-label']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['notifications-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['title-label']} */ ;
/** @type {__VLS_StyleScopedClasses['grade-label']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['notifications-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['title-label']} */ ;
/** @type {__VLS_StyleScopedClasses['grade-label']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['notifications-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['title-label']} */ ;
/** @type {__VLS_StyleScopedClasses['grade-label']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-settings-content']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['main-settings-account-container']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-acc-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['main-settings-account-container']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-acc-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['main-settings-account-container']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-acc-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['main-settings-account-container']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-acc-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account-track']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-header" },
});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showNotifs = !__VLS_ctx.showNotifs;
        } },
    ...{ class: "meta-button" },
    ref: "notifsBtn",
});
/** @type {typeof __VLS_ctx.notifsBtn} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-container" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.iconHtml) }, null, null);
if (__VLS_ctx.showNotifs) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notifications-dropdown" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notif-block title-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.docsData))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showNotifs))
                        return;
                    __VLS_ctx.$emit('notif-click', item);
                } },
            ...{ class: "notif-block" },
            ref: "notifBlocks",
        });
        /** @type {typeof __VLS_ctx.notifBlocks} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "label-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: "title-label" },
        });
        (item[1].title?.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: "grade-label" },
        });
        (item[1].grade?.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "selection-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item[1].buyerName);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openSettingsModal();
        } },
    ...{ class: "meta-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-settings-icon lucide-settings" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "12",
    cy: "12",
    r: "3",
});
if (__VLS_ctx.toggleSettingsModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-settings-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-settings-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleSettingsModal))
                    return;
                __VLS_ctx.closeSettingsModal();
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
        ...{ class: "settings-sidebar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-sidebar-option main-sidebar-option" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleSettingsModal))
                    return;
                __VLS_ctx.selectedSettingOption = 'account';
            } },
        ...{ class: "settings-sidebar-option" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-user-icon lucide-user" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "7",
        r: "4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleSettingsModal))
                    return;
                __VLS_ctx.selectedSettingOption = 'info';
            } },
        ...{ class: "settings-sidebar-option info-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-info-icon lucide-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "12",
        r: "10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M12 16v-4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M12 8h.01",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-container" },
    });
    if (__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-container content-account" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "main-settings-account-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (__VLS_ctx.userName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (__VLS_ctx.userEmail);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "side-btn-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ class: "form-input" },
            placeholder: "New password...",
        });
        (__VLS_ctx.newPassword);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.resetPassword();
                } },
            ...{ class: "apply-settings-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "linked-account-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.linkGoogleAccount();
                } },
            ...{ class: "linked-account" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 640 640",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z",
        });
        if (__VLS_ctx.googleLinkedEmail == null || __VLS_ctx.googleLinkedEmail == undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        if (__VLS_ctx.googleLinkedEmail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.googleLinkedEmail);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.linkMetaAccount();
                } },
            ...{ class: "linked-account" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 640 640",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z",
        });
        if (__VLS_ctx.facebookLinkedEmail == null || __VLS_ctx.facebookLinkedEmail == undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        if (__VLS_ctx.facebookLinkedEmail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.facebookLinkedEmail);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.linkTwitterAccount();
                } },
            ...{ class: "linked-account" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 640 640",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M523.4 215.7C523.7 220.2 523.7 224.8 523.7 229.3C523.7 368 418.1 527.9 225.1 527.9C165.6 527.9 110.4 510.7 64 480.8C72.4 481.8 80.6 482.1 89.3 482.1C138.4 482.1 183.5 465.5 219.6 437.3C173.5 436.3 134.8 406.1 121.5 364.5C128 365.5 134.5 366.1 141.3 366.1C150.7 366.1 160.1 364.8 168.9 362.5C120.8 352.8 84.8 310.5 84.8 259.5L84.8 258.2C98.8 266 115 270.9 132.2 271.5C103.9 252.7 85.4 220.5 85.4 184.1C85.4 164.6 90.6 146.7 99.7 131.1C151.4 194.8 229 236.4 316.1 240.9C314.5 233.1 313.5 225 313.5 216.9C313.5 159.1 360.3 112 418.4 112C448.6 112 475.9 124.7 495.1 145.1C518.8 140.6 541.6 131.8 561.7 119.8C553.9 144.2 537.3 164.6 515.6 177.6C536.7 175.3 557.2 169.5 576 161.4C561.7 182.2 543.8 200.7 523.4 215.7z",
        });
        if (__VLS_ctx.twitterLinkedEmail == null || __VLS_ctx.twitterLinkedEmail == undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        if (__VLS_ctx.twitterLinkedEmail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.twitterLinkedEmail);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.linkMicrosoftAccount();
                } },
            ...{ class: "linked-account" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 640 640",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z",
        });
        if (__VLS_ctx.microsoftLinkedEmail == null || __VLS_ctx.microsoftLinkedEmail == undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        if (__VLS_ctx.microsoftLinkedEmail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.microsoftLinkedEmail);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings delete-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'account' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.deleteAccount();
                } },
            ...{ class: "delete-acc-btn" },
        });
    }
    if (__VLS_ctx.selectedSettingOption == 'info' || __VLS_ctx.windowWidth <= 1025) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content-container content-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "side-btn-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ class: "form-input" },
            placeholder: "Enter display name...",
        });
        (__VLS_ctx.newDisplayName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'info' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.changeDisplayName();
                } },
            ...{ class: "apply-settings-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "side-btn-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "multiselect-wrapper" },
        });
        const __VLS_0 = {}.Multiselect;
        /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            modelValue: (__VLS_ctx.contactPreference),
            options: (__VLS_ctx.contactPreferenceOptions),
            placeholder: "Choose contact preference",
            multiple: (true),
            taggable: (true),
            searchable: (true),
            tagPlaceholder: "Add this as new tag",
            label: "name",
            trackBy: "code",
            ...{ class: "multiselect" },
        }));
        const __VLS_2 = __VLS_1({
            modelValue: (__VLS_ctx.contactPreference),
            options: (__VLS_ctx.contactPreferenceOptions),
            placeholder: "Choose contact preference",
            multiple: (true),
            taggable: (true),
            searchable: (true),
            tagPlaceholder: "Add this as new tag",
            label: "name",
            trackBy: "code",
            ...{ class: "multiselect" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'info' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.changeContactPreference();
                } },
            ...{ class: "apply-settings-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-field-settings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "side-btn-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "multiselect-wrapper" },
        });
        const __VLS_4 = {}.Multiselect;
        /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            modelValue: (__VLS_ctx.deliveryPreference),
            options: (__VLS_ctx.deliveryPreferenceOptions),
            placeholder: "Choose delivery preference",
            multiple: (true),
            taggable: (true),
            searchable: (true),
            tagPlaceholder: "Add this as new tag",
            label: "name",
            trackBy: "code",
            ...{ class: "multiselect" },
        }));
        const __VLS_6 = __VLS_5({
            modelValue: (__VLS_ctx.deliveryPreference),
            options: (__VLS_ctx.deliveryPreferenceOptions),
            placeholder: "Choose delivery preference",
            multiple: (true),
            taggable: (true),
            searchable: (true),
            tagPlaceholder: "Add this as new tag",
            label: "name",
            trackBy: "code",
            ...{ class: "multiselect" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleSettingsModal))
                        return;
                    if (!(__VLS_ctx.selectedSettingOption == 'info' || __VLS_ctx.windowWidth <= 1025))
                        return;
                    __VLS_ctx.changeDeliveryPreference();
                } },
            ...{ class: "apply-settings-btn" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['meta-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['notifications-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['notif-block']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['notif-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['title-label']} */ ;
/** @type {__VLS_StyleScopedClasses['grade-label']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-settings-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-settings-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-settings-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar-option']} */ ;
/** @type {__VLS_StyleScopedClasses['main-sidebar-option']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar-option']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-user-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-user']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-sidebar-option']} */ ;
/** @type {__VLS_StyleScopedClasses['info-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-info-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-info']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['content-account']} */ ;
/** @type {__VLS_StyleScopedClasses['main-settings-account-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['side-btn-track']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account-track']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-account']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-acc-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['content-info']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['side-btn-track']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['side-btn-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['data-field-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['side-btn-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-settings-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Multiselect: Multiselect,
            userName: userName,
            userEmail: userEmail,
            docsData: docsData,
            googleLinkedEmail: googleLinkedEmail,
            facebookLinkedEmail: facebookLinkedEmail,
            twitterLinkedEmail: twitterLinkedEmail,
            microsoftLinkedEmail: microsoftLinkedEmail,
            showNotifs: showNotifs,
            notifsBtn: notifsBtn,
            iconHtml: iconHtml,
            toggleSettingsModal: toggleSettingsModal,
            selectedSettingOption: selectedSettingOption,
            contactPreferenceOptions: contactPreferenceOptions,
            contactPreference: contactPreference,
            deliveryPreferenceOptions: deliveryPreferenceOptions,
            deliveryPreference: deliveryPreference,
            newPassword: newPassword,
            deleteAccount: deleteAccount,
            resetPassword: resetPassword,
            linkGoogleAccount: linkGoogleAccount,
            linkMetaAccount: linkMetaAccount,
            linkTwitterAccount: linkTwitterAccount,
            linkMicrosoftAccount: linkMicrosoftAccount,
            newDisplayName: newDisplayName,
            changeDisplayName: changeDisplayName,
            changeContactPreference: changeContactPreference,
            changeDeliveryPreference: changeDeliveryPreference,
            windowWidth: windowWidth,
            openSettingsModal: openSettingsModal,
            closeSettingsModal: closeSettingsModal,
        };
    },
    props: {
        title: String
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        title: String
    },
});
; /* PartiallyEnd: #4569/main.vue */
