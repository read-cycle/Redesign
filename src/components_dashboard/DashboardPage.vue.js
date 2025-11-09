import Sidebar from '../components/Sidebar.vue';
import Hero from './Hero.vue';
import Table from './Table.vue';
import MetaBar from '../components/MetaBar.vue';
import StatOption from './StatOption.vue';
const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binoculars-icon lucide-binoculars"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M 22 16 L 2 16"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>'];
const tableIcons = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-user-icon lucide-book-user"><path d="M15 13a3 3 0 1 0-6 0"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binoculars-icon lucide-binoculars"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M 22 16 L 2 16"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/></svg>'];
import { isRef, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import { auth, db } from '../firebase-init';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import bookSVG from '../assets/icons/book.svg';
import infoSVG from '../assets/icons/info.svg';
import checkSVG from '../assets/icons/check.svg';
import Multiselect from 'vue-multiselect';
import ISBN from 'isbn-utils';
import Navbar from '../components/Navbar.vue';
let userID = null;
let userEmail = null;
const pendingData = ref([]);
const watchData = ref([]);
const uploadData = ref([]);
onAuthStateChanged(auth, (user) => {
    if (user) {
        userID = user.uid;
        userEmail = user.email;
        const pendingDocs = query(collection(db, 'buyerRequested'), where('buyerID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(pendingDocs).then((result) => {
            pendingData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
        const watchDocs = query(collection(db, 'watchlist'), where('buyerID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(watchDocs).then((result) => {
            watchData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
        const uploadDocs = query(collection(db, 'uploadPool'), where('uploaderID', '==', userID), orderBy('timestamp', 'desc'));
        getDocs(uploadDocs).then((result) => {
            uploadData.value = result.docs.map((doc) => {
                const data = doc.data();
                return [doc.ref, { id: doc.id, ...data }];
            });
        });
    }
    else {
        router.push('/login');
    }
});
const toggleModal = ref(false);
const selectedNotif = ref(null);
function openModal(item) {
    selectedNotif.value = item;
    toggleModal.value = true;
    window.scrollY = 0;
    document.body.style.overflow = "hidden";
}
const toggleWatchlistModal = ref(false);
function openWatchlistModal() {
    toggleWatchlistModal.value = true;
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
const slideIcons = [bookSVG, infoSVG, checkSVG];
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
const progressThresholds = [100, 100, 100];
const progresses = ref([0, 0, 100]);
const contactPreferenceOptions = [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }];
const buyerContactPreference = ref([]);
const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }];
const buyerDeliveryPreference = ref([]);
const buyerName = ref('');
const buyerQuantity = ref(1);
function updateProgress(delta) {
    progresses.value[activeSlide.value - 1] = Math.min(100, Math.max(0, progresses.value[activeSlide.value - 1] + delta));
}
const activeSlide = ref(1);
const isISBNDisabled = ref(false);
const isTitleDisabled = ref(false);
const ISBNOptions = ref([
    { name: 'Ex1 Thing', code: 'ex1-thing' },
    { name: 'Ex2 Thing', code: 'ex2-thing' },
    { name: 'Ex3 Thing', code: 'ex3-thing' }
]);
const selectedISBN = ref();
watch(selectedISBN, (newISBN) => {
    if (newISBN == null) {
        isTitleDisabled.value = false;
        selectedTitle.value = null;
        return;
    }
    else {
        isTitleDisabled.value = true;
    }
    console.log(newISBN.code);
    const raw = newISBN?.code?.replace(/[-\s]/g, '');
    if (ISBN.isValid(raw)) {
        const isbnObj = ISBN.parse(raw);
        console.log('Valid ISBN:', isbnObj.asIsbn13());
        fetch(`https://openlibrary.org/isbn/${isbnObj.asIsbn13()}.json`)
            .then(res => res.json())
            .then(data => {
            console.log(data);
            const title = data.title;
            selectedTitle.value = {
                name: title,
                code: title.toLowerCase().replace(/\s+/g, '-')
            };
        });
    }
    else {
        console.log('Invalid ISBN');
    }
});
const selectedTitle = ref();
watch(selectedTitle, (newTitle) => {
    if (newTitle == null) {
        isISBNDisabled.value = false;
        return;
    }
    else if (isTitleDisabled.value == false) {
        isISBNDisabled.value = true;
        selectedISBN.value = null;
    }
});
const gradeOptions = ref([
    { name: 'Grade 1', code: 'g1' },
    { name: 'Grade 2', code: 'g2' },
    { name: 'Grade 3', code: 'g3' },
    { name: 'Grade 4', code: 'g4' },
    { name: 'Grade 5', code: 'g5' },
    { name: 'Grade 6', code: 'g6' },
    { name: 'Grade 7', code: 'g7' },
    { name: 'Grade 8', code: 'g8' },
    { name: 'Grade 9', code: 'g9' },
    { name: 'Grade 10', code: 'g10' },
    { name: 'Grade 11', code: 'g11' },
    { name: 'Grade 12', code: 'g12' }
]);
const titleOptions = ref([
    { name: 'Ex1 Thing', code: 'ex1-thing' },
    { name: 'Ex2 Thing', code: 'ex2-thing' },
    { name: 'Ex3 Thing', code: 'ex3-thing' }
]);
const selectedGrade = ref();
let tagOptions = ref([
    { name: 'Ex1 Thing', code: 'ex1-thing' },
    { name: 'Ex2 Thing', code: 'ex2-thing' },
    { name: 'Ex3 Thing', code: 'ex3-thing' }
]);
let selectedTags = ref([]);
const extraInfo = ref('');
const slides = [
    {
        header: 'Book Details',
        sections: [
            {
                label: 'ISBN',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "ISBNMS",
                            name: "ISBNMS",
                            modelValue: selectedISBN,
                            'onUpdate:modelValue': (val) => selectedISBN.value = val,
                            options: ISBNOptions,
                            searchable: true,
                            taggable: true,
                            placeholder: 'Enter ISBN',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                            disabled: isISBNDisabled,
                            onTag: (newTag) => {
                                const tagObj = {
                                    name: newTag,
                                    code: newTag.replace(/[\s-]/g, '')
                                };
                                addItem(tagObj, ISBNOptions, selectedISBN, false);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Book Title',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "titleMS",
                            name: "titleMS",
                            modelValue: selectedTitle,
                            'onUpdate:modelValue': (val) => selectedTitle.value = val,
                            options: titleOptions,
                            searchable: true,
                            taggable: true,
                            placeholder: 'Enter Book Title',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                            disabled: isTitleDisabled,
                            onTag: (newTag) => {
                                const tagObj = {
                                    name: newTag,
                                    code: newTag.replace(/[\s-]/g, '')
                                };
                                addItem(tagObj, titleOptions, selectedTitle, false);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Grade',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "gradeMS",
                            name: "gradeMS",
                            modelValue: selectedGrade,
                            'onUpdate:modelValue': (val) => selectedGrade.value = val,
                            options: gradeOptions,
                            searchable: true,
                            taggable: true,
                            placeholder: 'Enter Grade',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                            onTag: (newTag) => {
                                const tagObj = {
                                    name: newTag,
                                    code: newTag.replace(/[\s-]/g, '')
                                };
                                addItem(tagObj, gradeOptions, selectedGrade, false);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Tags',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "tagging",
                            name: "tagger",
                            modelValue: selectedTags,
                            'onUpdate:modelValue': (val) => selectedTags.value = val,
                            options: tagOptions,
                            multiple: true,
                            taggable: true,
                            searchable: true,
                            placeholder: 'Type to search or add tag',
                            tagPlaceholder: 'Add this as new tag',
                            label: 'name',
                            trackBy: 'code',
                            class: 'multiselect',
                            onTag: (newTag) => {
                                const tagObj = {
                                    name: newTag,
                                    code: newTag.replace(/[\s-]/g, '')
                                };
                                addItem(tagObj, tagOptions, selectedTags, true);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Extra Information',
                data: [
                    {
                        component: 'textarea',
                        props: {
                            value: extraInfo.value,
                            onInput: (e) => extraInfo.value = e.target.value,
                            type: 'text',
                            min: 0
                        }
                    }
                ]
            }
        ]
    },
    {
        header: 'Add to Watchlist',
        desc: 'Add a book to your watchlist to be notified when its available!',
        sections: [
            {
                label: 'Your Name',
                data: [
                    {
                        component: 'input',
                        props: {
                            value: buyerName,
                            onInput: (e) => buyerName.value = e.target.value,
                            type: 'text',
                            placeholder: 'Enter your name',
                            class: 'form-input'
                        }
                    }
                ]
            },
            {
                label: 'Quantity',
                data: [
                    {
                        component: 'input',
                        props: {
                            value: buyerQuantity,
                            onInput: (e) => buyerQuantity.value = +e.target.value,
                            type: 'number',
                            placeholder: 'Enter quantity you want',
                            min: 1,
                            class: 'form-input quantity-input'
                        }
                    }
                ]
            },
            {
                label: 'Delivery Preference',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            modelValue: buyerDeliveryPreference,
                            'onUpdate:modelValue': (val) => buyerDeliveryPreference.value = val,
                            options: deliveryPreferenceOptions,
                            placeholder: 'Choose delivery preference',
                            multiple: true,
                            taggable: true,
                            searchable: true,
                            tagPlaceholder: 'Add this as new tag',
                            label: 'name',
                            trackBy: 'code',
                            class: 'multiselect',
                        }
                    }
                ]
            },
            {
                label: 'Contact Preference',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            modelValue: buyerContactPreference,
                            'onUpdate:modelValue': (val) => buyerContactPreference.value = val,
                            options: contactPreferenceOptions,
                            placeholder: 'Choose contact preference',
                            multiple: true,
                            taggable: true,
                            searchable: true,
                            tagPlaceholder: 'Add this as new tag',
                            label: 'name',
                            trackBy: 'code',
                            class: 'multiselect',
                        }
                    }
                ]
            }
        ]
    }
];
function addItem(newItem, optionsRef, selectedRef, multiple) {
    const exists = optionsRef.value.some(opt => JSON.stringify(opt) === JSON.stringify(newItem));
    if (!exists) {
        optionsRef.value.push(newItem);
    }
    if (multiple) {
        if (Array.isArray(selectedRef.value)) {
            selectedRef.value.push(newItem);
        }
        else {
            selectedRef.value = [newItem];
        }
    }
    else {
        selectedRef.value = newItem;
    }
}
async function nextSlide() {
    if (progresses.value[activeSlide.value - 1] >= progressThresholds[activeSlide.value - 1]) {
        setTimeout(() => {
            activeSlide.value++;
        }, 375);
        if (activeSlide.value == 2) {
            try {
                await addDoc(collection(db, "watchlist"), {
                    buyerName: buyerName.value,
                    buyerContactPreference: buyerContactPreference.value,
                    buyerDeliveryPreference: buyerDeliveryPreference.value,
                    buyerQuantity: buyerQuantity.value,
                    buyerID: userID,
                    title: selectedTitle.value,
                    tags: selectedTags.value,
                    isbn: selectedISBN.value,
                    grade: selectedGrade.value,
                    timestamp: serverTimestamp(),
                    buyerEmail: userEmail
                });
                console.log("Document moved to buyerRequested successfully");
            }
            catch (err) {
                console.error("Error moving document:", err);
            }
        }
    }
    else {
        window.alert("Please fill in all required fields.");
    }
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
        dropdown.style.zIndex = "9999";
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
onMounted(async () => {
    watch([buyerName, buyerDeliveryPreference, buyerContactPreference, buyerQuantity, selectedISBN, selectedGrade, selectedTitle, selectedTags], ([newName, newDelivery, newContact, newQuantity, newISBN, newGrade, newTitle, newTags], [oldName, oldDelivery, oldContact, oldQuantity, oldISBN, oldGrade, oldTitle, oldTags]) => {
        let delta = 0;
        if (newISBN && !oldISBN)
            delta += 25;
        if (!newISBN && oldISBN)
            delta -= 25;
        if (newTitle && !oldTitle)
            delta += 25;
        if (!newTitle && oldTitle)
            delta -= 25;
        if (newGrade && !oldGrade)
            delta += 25;
        if (!newGrade && oldGrade)
            delta -= 25;
        const newTagsLen = newTags.length;
        const oldTagsLen = oldTags.length;
        if (newTagsLen > 0 && oldTagsLen === 0)
            delta += 25;
        if (newTagsLen === 0 && oldTagsLen > 0)
            delta -= 25;
        if (newName && !oldName)
            delta += 20;
        if (!newName && oldName)
            delta -= 20;
        if (newQuantity && !oldQuantity)
            delta += 100 / 3;
        if (!newQuantity && oldQuantity)
            delta -= 100 / 3;
        const newContactPreferenceLen = Array.isArray(newContact) ? newContact.length : 0;
        const oldContactPreferenceLen = Array.isArray(oldContact) ? oldContact.length : 0;
        if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0)
            delta += 100 / 3;
        if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0)
            delta -= 100 / 3;
        const newDeliveryLen = newDelivery.length;
        const oldDeliveryLen = oldDelivery.length;
        if (newDeliveryLen > 0 && oldDeliveryLen === 0)
            delta += 100 / 3;
        if (newDeliveryLen === 0 && oldDeliveryLen > 0)
            delta -= 100 / 3;
        updateProgress(delta);
    });
});
function deepUnref(obj) {
    if (isRef(obj)) {
        return obj.value;
    }
    if (Array.isArray(obj)) {
        return obj.map(deepUnref);
    }
    if (obj !== null && typeof obj === 'object') {
        const unreffed = {};
        for (const key in obj) {
            unreffed[key] = deepUnref(obj[key]);
        }
        return unreffed;
    }
    return obj;
}
function closeWatchlistModal() {
    toggleWatchlistModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
function closeModal() {
    toggleModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['listingTable']} */ ;
/** @type {__VLS_StyleScopedClasses['watchlistTable']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-half']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
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
/** @type {__VLS_StyleScopedClasses['button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-header']} */ ;
/** @type {__VLS_StyleScopedClasses['requester-data']} */ ;
/** @type {__VLS_StyleScopedClasses['book-metadata']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
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
    ...{ class: "main-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metabar-container" },
});
/** @type {[typeof MetaBar, typeof MetaBar, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(MetaBar, new MetaBar({
    ...{ 'onNotifClick': {} },
    title: ('Dashboard'),
    ref: "metaBar",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onNotifClick': {} },
    title: ('Dashboard'),
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
/** @type {[typeof Hero, typeof Hero, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(Hero, new Hero({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
/** @type {[typeof Table, typeof Table, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(Table, new Table({
    ...{ class: "listingTable" },
    tableType: ('listings'),
    header: ('My Listings'),
    icon: (__VLS_ctx.tableIcons[0]),
}));
const __VLS_19 = __VLS_18({
    ...{ class: "listingTable" },
    tableType: ('listings'),
    header: ('My Listings'),
    icon: (__VLS_ctx.tableIcons[0]),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
/** @type {[typeof Table, typeof Table, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(Table, new Table({
    ...{ 'onWatchlistClick': {} },
    ...{ class: "watchlistTable" },
    tableType: ('watchlist'),
    header: ('Watchlist'),
    icon: (__VLS_ctx.tableIcons[1]),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onWatchlistClick': {} },
    ...{ class: "watchlistTable" },
    tableType: ('watchlist'),
    header: ('Watchlist'),
    icon: (__VLS_ctx.tableIcons[1]),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onWatchlistClick: (__VLS_ctx.openWatchlistModal)
};
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-container" },
});
/** @type {[typeof StatOption, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(StatOption, new StatOption({
    ...{ class: "stat-light" },
    header: ('Pending'),
    text: (`${__VLS_ctx.pendingData.length}`),
    icon: (__VLS_ctx.icons[0]),
}));
const __VLS_29 = __VLS_28({
    ...{ class: "stat-light" },
    header: ('Pending'),
    text: (`${__VLS_ctx.pendingData.length}`),
    icon: (__VLS_ctx.icons[0]),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
/** @type {[typeof StatOption, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(StatOption, new StatOption({
    ...{ class: "stat-normal" },
    header: ('Uploads'),
    text: (`${__VLS_ctx.uploadData.length}`),
    icon: (__VLS_ctx.icons[2]),
}));
const __VLS_32 = __VLS_31({
    ...{ class: "stat-normal" },
    header: ('Uploads'),
    text: (`${__VLS_ctx.uploadData.length}`),
    icon: (__VLS_ctx.icons[2]),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
/** @type {[typeof StatOption, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(StatOption, new StatOption({
    ...{ class: "stat-dark" },
    header: ('Watching'),
    text: (`${__VLS_ctx.watchData.length}`),
    icon: (__VLS_ctx.icons[1]),
}));
const __VLS_35 = __VLS_34({
    ...{ class: "stat-dark" },
    header: ('Watching'),
    text: (`${__VLS_ctx.watchData.length}`),
    icon: (__VLS_ctx.icons[1]),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
if (__VLS_ctx.toggleModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-confirmation-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-confirmation-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleModal))
                    return;
                __VLS_ctx.closeModal();
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
                if (!(__VLS_ctx.toggleModal))
                    return;
                __VLS_ctx.activeState = __VLS_ctx.possibleStates[0];
                __VLS_ctx.acceptRequest();
            } },
        ...{ class: "accept-btn" },
        disabled: (__VLS_ctx.activeState?.[0] != null),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleModal))
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
    const __VLS_37 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        name: "fade-in",
    }));
    const __VLS_39 = __VLS_38({
        name: "fade-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
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
    var __VLS_40;
}
if (__VLS_ctx.toggleWatchlistModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-watchlist-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-watchlist-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleWatchlistModal))
                    return;
                __VLS_ctx.closeWatchlistModal();
            } },
        ...{ class: "close-btn" },
    });
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slide-number-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "slide-number" },
        key: (__VLS_ctx.activeSlide),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.slideIcons[__VLS_ctx.activeSlide - 1]),
        width: "24",
        height: "24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: __VLS_ctx.progresses[__VLS_ctx.activeSlide - 1] + '%' }) },
    });
    const __VLS_41 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        name: "fade-slide",
        mode: "out-in",
    }));
    const __VLS_43 = __VLS_42({
        name: "fade-slide",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slide-container" },
        key: (__VLS_ctx.activeSlide),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-half" },
    });
    if (__VLS_ctx.activeSlide !== 3) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "header-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].header);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].desc);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-container" },
    });
    if (__VLS_ctx.activeSlide !== 3) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "other-container-misc" },
        });
        for (const [section, i] of __VLS_getVForSourceType((__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].sections))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-section" },
                key: (i),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "section-label" },
            });
            (section.label);
            for (const [dataComp, j] of __VLS_getVForSourceType((section.data))) {
                const __VLS_45 = ((dataComp.component));
                // @ts-ignore
                const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }));
                const __VLS_47 = __VLS_46({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            }
        }
    }
    if (__VLS_ctx.activeSlide === 3) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "confirmation-container" },
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
            ...{ class: "lucide lucide-circle-check-big-icon lucide-circle-check-big" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M21.801 10A10 10 0 1 1 17 3.335",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m9 11 3 3L22 4",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "confirmation-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    }
    if (__VLS_ctx.activeSlide !== 3) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "btn-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toggleWatchlistModal))
                        return;
                    if (!(__VLS_ctx.activeSlide !== 3))
                        return;
                    __VLS_ctx.nextSlide();
                } },
            ...{ class: "proceed-btn" },
        });
    }
    if (__VLS_ctx.activeSlide !== 3) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "images-half" },
        });
    }
    var __VLS_44;
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['listingTable']} */ ;
/** @type {__VLS_StyleScopedClasses['watchlistTable']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-light']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-dark']} */ ;
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
/** @type {__VLS_StyleScopedClasses['modal-watchlist-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-watchlist-content']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-half']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['other-container-misc']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-circle-check-big-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-circle-check-big']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
// @ts-ignore
var __VLS_14 = __VLS_13;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Sidebar: Sidebar,
            Hero: Hero,
            Table: Table,
            MetaBar: MetaBar,
            StatOption: StatOption,
            icons: icons,
            tableIcons: tableIcons,
            Navbar: Navbar,
            pendingData: pendingData,
            watchData: watchData,
            uploadData: uploadData,
            toggleModal: toggleModal,
            selectedNotif: selectedNotif,
            openModal: openModal,
            toggleWatchlistModal: toggleWatchlistModal,
            openWatchlistModal: openWatchlistModal,
            possibleStates: possibleStates,
            activeState: activeState,
            acceptRequest: acceptRequest,
            slideIcons: slideIcons,
            denyRequest: denyRequest,
            progresses: progresses,
            activeSlide: activeSlide,
            slides: slides,
            nextSlide: nextSlide,
            deepUnref: deepUnref,
            closeWatchlistModal: closeWatchlistModal,
            closeModal: closeModal,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
