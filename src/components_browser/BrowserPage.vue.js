/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import BrowserCard from './BrowserCard.vue';
import Multiselect from 'vue-multiselect';
import { computed, isRef, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Datepicker from 'vue3-datepicker';
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase-init';
import {} from '../interfaces';
import bookSVG from '../assets/icons/book.svg';
import infoSVG from '../assets/icons/info.svg';
import checkSVG from '../assets/icons/check.svg';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import { sendEmail } from '../sendEmail';
import Navbar from '../components/Navbar.vue';
import { isbnToSubject } from "../assets/BookMappings";
let userID = null;
let displayName = null;
async function autofillUserData() {
    if (!userID || !displayName)
        return;
    const snap = await getDoc(doc(db, "users", userID));
    buyerName.value = displayName;
    if (snap.exists()) {
        const data = snap.data();
        buyerContactPreference.value = data.contactPreferences;
        buyerDeliveryPreference.value = data.deliveryPreferences;
    }
}
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userID = user.uid;
        displayName = user.displayName;
        await autofillUserData();
    }
    else {
        router.push('/login');
    }
});
const fromDate = ref(undefined);
const toDate = ref(undefined);
const filterButtonRef = ref(null);
const sortButtonRef = ref(null);
const subjectOptions = Array.from(new Set(Object.values(isbnToSubject))).map((val) => ({
    name: val,
    code: val.toLowerCase().replace(/\s+/g, '-')
}));
const fieldOptions = [
    'Grade',
    'Date'
];
const selectedField = ref();
const sortOptions = [
    'Ascending',
    'Descending',
];
const selectedSort = ref();
function applySort() {
    if (selectedField.value == 'Grade') {
        filteredDocs.value.sort((a, b) => {
            const gradeA = a[1].grade ? parseInt(a[1].grade.code.slice(1)) : 0;
            const gradeB = b[1].grade ? parseInt(b[1].grade.code.slice(1)) : 0;
            if (selectedSort.value === 'Ascending') {
                return gradeA - gradeB;
            }
            else {
                return gradeB - gradeA;
            }
        });
    }
    else if (selectedField.value == 'Date') {
        filteredDocs.value.sort((a, b) => {
            const timeA = a[1].timestamp ? a[1].timestamp.toMillis() : 0;
            const timeB = b[1].timestamp ? b[1].timestamp.toMillis() : 0;
            if (selectedSort.value === 'Ascending') {
                return timeA - timeB;
            }
            else {
                return timeB - timeA;
            }
        });
    }
}
const selectedSubjects = ref([]);
const gradeOptions = ref([
    { code: 'g1', name: 'Grade 1' },
    { code: 'g2', name: 'Grade 2' },
    { code: 'g3', name: 'Grade 3' },
    { code: 'g4', name: 'Grade 4' },
    { code: 'g5', name: 'Grade 5' },
    { code: 'g6', name: 'Grade 6' },
    { code: 'g7', name: 'Grade 7' },
    { code: 'g8', name: 'Grade 8' },
    { code: 'g9', name: 'Grade 9' },
    { code: 'g10', name: 'Grade 10' },
    { code: 'g11', name: 'Grade 11' },
    { code: 'g12', name: 'Grade 12' },
]);
const selectedGrades = ref([]);
const selectedISBNs = ref([]);
let tagOptions = ref([
    { name: 'Ex1 Thing', code: 'ex1-thing' },
    { name: 'Ex2 Thing', code: 'ex2-thing' },
    { name: 'Ex3 Thing', code: 'ex3-thing' }
]);
const selectedTags = ref([]);
const searchQuery = ref('');
const showFilters = ref(false);
const showSorts = ref(false);
const today = new Date();
const uploadDocs = query(collection(db, 'uploadPool'), orderBy('timestamp', 'desc'));
const docsData = ref([]);
const cards = ref([]);
const filteredDocs = ref([]);
getDocs(uploadDocs).then((result) => {
    docsData.value = result.docs.map((doc) => {
        const data = doc.data();
        return [doc.ref, { id: doc.id, ...data }];
    });
    filteredDocs.value = [...docsData.value];
    nextTick(() => {
        cards.value = Array.from(document.querySelectorAll('.browsercard-container'));
        console.log(cards.value);
    });
});
const toggleModal = ref(false);
const currentDocRef = ref(filteredDocs?.value?.[1]?.[0]);
const currentCardData = ref(filteredDocs?.value?.[1]?.[1]);
const currentImageIndex = ref(0);
const images = computed(() => [
    currentCardData.value?.listingImage,
    ...(currentCardData.value?.extraImages || [])
].filter(Boolean));
const isLeftDisabled = computed(() => currentImageIndex.value <= 0);
const isRightDisabled = computed(() => currentImageIndex.value >= images.value.length - 1);
const direction = ref('forwards');
watch(toggleModal, (newState, oldState) => {
    console.log("TOGGLE MODAL STATE:", newState);
    if (newState && !oldState) {
        currentImageIndex.value = 0;
        activeSlide.value = 1;
    }
});
function prevImage() {
    direction.value = 'backwards';
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
    }
}
function nextImage() {
    direction.value = 'forwards';
    if (currentImageIndex.value < images.value.length - 1) {
        currentImageIndex.value++;
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
                // also check children of added node
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
const activeSlide = ref(1);
const slideIcons = [bookSVG, infoSVG, checkSVG];
const progressThresholds = [100, 100];
const progresses = ref([100, 0]);
const contactPreferenceOptions = [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }];
const buyerContactPreference = ref([]);
const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }];
const buyerDeliveryPreference = ref([]);
const buyerName = ref('');
const buyerQuantity = ref(1);
watch([buyerName, buyerDeliveryPreference, buyerContactPreference, buyerQuantity], ([newName, newDelivery, newContact, newQuantity], [oldName, oldDelivery, oldContact, oldQuantity]) => {
    if (newName && !oldName)
        progresses.value[1] += 20;
    if (!newName && oldName)
        progresses.value[1] -= 20;
    if (newQuantity && !oldQuantity)
        progresses.value[1] += 100 / 3;
    if (!newQuantity && oldQuantity)
        progresses.value[1] -= 100 / 3;
    const newContactPreferenceLen = Array.isArray(newContact) ? newContact.length : 0;
    const oldContactPreferenceLen = Array.isArray(oldContact) ? oldContact.length : 0;
    if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0)
        progresses.value[1] += 100 / 3;
    if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0)
        progresses.value[1] -= 100 / 3;
    const newDeliveryLen = newDelivery.length;
    const oldDeliveryLen = oldDelivery.length;
    if (newDeliveryLen > 0 && oldDeliveryLen === 0)
        progresses.value[1] += 100 / 3;
    if (newDeliveryLen === 0 && oldDeliveryLen > 0)
        progresses.value[1] -= 100 / 3;
    console.log("PROGRESSES: ", progresses.value);
});
async function nextSlide() {
    if (progresses.value[activeSlide.value - 1] >= progressThresholds[activeSlide.value - 1]) {
        console.log("ACTIVESLIDE: ", activeSlide.value);
        setTimeout(() => {
            activeSlide.value++;
        }, 375);
        if (activeSlide.value == slides.length) {
            if (!currentDocRef.value) {
                console.error("No document reference found in currentDocRef");
                return;
            }
            try {
                const docSnap = await getDoc(currentDocRef.value);
                if (!docSnap.exists()) {
                    console.error("Document does not exist");
                    return;
                }
                const docData = docSnap.data();
                sendEmail(docData.uploaderEmail, 'Your book has been requested!', 'Yay!!');
                await addDoc(collection(db, "buyerRequested"), {
                    ...docData,
                    buyerName: buyerName.value,
                    buyerContactPreference: buyerContactPreference.value,
                    buyerDeliveryPreference: buyerDeliveryPreference.value,
                    buyerQuantity: buyerQuantity.value,
                    buyerID: userID
                });
                await deleteDoc(currentDocRef.value);
                console.log("Document moved to buyerRequested successfully");
            }
            catch (err) {
                console.error("Error moving document:", err);
            }
        }
    }
    else {
        window.alert("Please fill in all required fields.");
        console.log("ERROR PROGRESSES: ", progresses.value);
    }
}
function getText(dataComp) {
    return dataComp.props.text.value;
}
const slides = [
    {
        header: computed(() => currentCardData.value?.title?.name || 'Confirmation'),
        desc1: computed(() => currentCardData.value?.grade?.name || 'Grade ?'),
        desc2: computed(() => currentCardData.value?.uploaderName || 'Anonymous'),
        sections: [
            {
                label: 'Book Details',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Tags: ${currentCardData.value?.tags?.length
                                ? currentCardData.value.tags.map(tag => tag.name).join(', ')
                                : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Condition',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Condition: ${currentCardData.value?.condition?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Condition Details: ${currentCardData.value?.conditionDetails?.length
                                ? currentCardData.value.conditionDetails.map(tag => tag.name).join(', ')
                                : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Pricing & Quantity',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Price Mode: ${currentCardData.value?.priceMode?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Price: ${currentCardData.value?.price != null ? `₹${currentCardData.value.price}` : 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Quantity: ${currentCardData.value?.quantity != null
                                ? currentCardData.value.quantity
                                : 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Delivery',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Delivery Preference: ${currentCardData.value?.deliveryPreference?.length
                                ? currentCardData.value.deliveryPreference.map(tag => tag.name).join(', ')
                                : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Contact',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Contact Preference: ${currentCardData.value?.contactPreference?.length
                                ? currentCardData.value.contactPreference.map(tag => tag.name).join(', ')
                                : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Extra Info',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => currentCardData.value?.extraInfo || 'None'),
                            class: 'confirmation-field'
                        }
                    }
                ]
            }
        ]
    },
    {
        header: 'Request Details',
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
function applyFilters() {
    filteredDocs.value = docsData.value.filter(([_, doc]) => {
        console.log("CHECKING");
        if (selectedTags.value.length >= 1) {
            if (!doc.tags || !selectedTags.value.every(sel => doc.tags.some(tag => tag.code === sel.code))) {
                return false;
            }
        }
        console.log("PASSED TAGS", selectedTags.value);
        if (selectedGrades.value.length >= 1) {
            if (!doc.grade || !selectedGrades.value.some(g => g.code === doc.grade?.code)) {
                console.log('Selected grades:', selectedGrades.value.map(g => g.code));
                console.log('Doc grade:', doc.grade?.code);
                return false;
            }
        }
        console.log("PASSED GRADES", selectedGrades.value);
        if (selectedISBNs.value.length >= 1) {
            if (!doc.isbn || !selectedISBNs.value.some(i => i.code === doc.isbn?.code)) {
                return false;
            }
        }
        console.log("PASSED ISBNS", selectedISBNs.value);
        const docTime = doc.timestamp.toMillis();
        if (fromDate.value && docTime < fromDate.value.getTime())
            return false;
        if (toDate.value && docTime > toDate.value.getTime())
            return false;
        console.log("PASSED TIMES");
        return true;
    });
}
;
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
function addItem(newItem, options, selected, multiple) {
    const getArray = (val) => ('value' in val ? val.value : val);
    const optionsArr = getArray(options);
    const exists = optionsArr.some(opt => JSON.stringify(opt) === JSON.stringify(newItem));
    if (!exists)
        optionsArr.push(newItem);
    if ('value' in selected) {
        if (multiple) {
            if (!Array.isArray(selected.value))
                selected.value = selected.value != null ? [selected.value] : [];
            selected.value.push(newItem);
        }
        else {
            selected.value = newItem;
        }
    }
    else {
        if (multiple) {
            if (!Array.isArray(selected))
                throw new Error("Expected selected to be an array for multiple=true");
            selected.push(newItem);
        }
        else {
            selected = newItem;
        }
    }
}
function openBrowserCardModal() {
    toggleModal.value = !toggleModal.value;
    window.scrollY = 0;
    document.body.style.overflow = "hidden";
}
function closeBrowserCardModal() {
    toggleModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
function closeModal() {
    toggleConfirmationModal.value = false;
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
}
const windowWidth = ref(window.innerWidth);
watch(searchQuery, (newQuery) => {
    const query = newQuery.toLowerCase().trim();
    applyFilters();
    filteredDocs.value = filteredDocs.value.filter(doc => {
        const title = doc[1].title?.name.toLowerCase() || "";
        const gradeName = doc[1].grade?.name?.toLowerCase() || "";
        const tags = doc[1].tags?.map(t => t.name.toLowerCase()) || [];
        console.log(doc, (title.includes(query) ||
            gradeName.includes(query) ||
            tags.some(tag => tag.includes(query))));
        return (title.includes(query) ||
            gradeName.includes(query) ||
            tags.some(tag => tag.includes(query)));
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['text-half']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-container']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['image-half']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['images-half']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['proceed-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-button']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
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
    title: ('Browser'),
    ref: "metaBar",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onNotifClick': {} },
    title: ('Browser'),
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
    ...{ class: "filters-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "search-input" },
    type: "text",
    placeholder: "Search...",
    value: (__VLS_ctx.searchQuery),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filters-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-btn-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showSorts = !__VLS_ctx.showSorts;
        } },
    ...{ class: "option-btn sort-button" },
    title: "Sorting Options",
    ref: "sortButtonRef",
});
/** @type {typeof __VLS_ctx.sortButtonRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    ...{ class: "lucide lucide-arrow-down-wide-narrow-icon lucide-arrow-down-wide-narrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m3 16 4 4 4-4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M7 20V4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 4h10",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 8h7",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 12h4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showFilters = !__VLS_ctx.showFilters;
        } },
    ...{ class: "option-btn filter-button" },
    title: "More Filters",
    ref: "filterButtonRef",
});
/** @type {typeof __VLS_ctx.filterButtonRef} */ ;
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
if (__VLS_ctx.showFilters) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-dropdown" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block title-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.selectedSubjects = [];
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_15 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        modelValue: (__VLS_ctx.selectedSubjects),
        options: (__VLS_ctx.subjectOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Subjects",
        ...{ class: "multiselect tag-multiselect" },
    }));
    const __VLS_17 = __VLS_16({
        modelValue: (__VLS_ctx.selectedSubjects),
        options: (__VLS_ctx.subjectOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Subjects",
        ...{ class: "multiselect tag-multiselect" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.selectedISBNs = [];
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_19 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
        ...{ 'onTag': {} },
        modelValue: (__VLS_ctx.selectedGrades),
        options: (__VLS_ctx.gradeOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Grades",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onTag': {} },
        modelValue: (__VLS_ctx.selectedGrades),
        options: (__VLS_ctx.gradeOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Grades",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_23;
    let __VLS_24;
    let __VLS_25;
    const __VLS_26 = {
        onTag: ((newTag) => {
            const tagObj = {
                name: newTag,
                code: newTag.replace(/[\s-]/g, '')
            };
            __VLS_ctx.addItem(tagObj, __VLS_ctx.gradeOptions, __VLS_ctx.selectedGrades, true);
        })
    };
    var __VLS_22;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.selectedGrades = [];
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_27 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        modelValue: (__VLS_ctx.selectedGrades),
        options: (__VLS_ctx.gradeOptions),
        multiple: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Grades",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }));
    const __VLS_29 = __VLS_28({
        modelValue: (__VLS_ctx.selectedGrades),
        options: (__VLS_ctx.gradeOptions),
        multiple: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Grades",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.fromDate = undefined;
                __VLS_ctx.toDate = undefined;
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track date-selection-track" },
    });
    const __VLS_31 = {}.Datepicker;
    /** @type {[typeof __VLS_components.Datepicker, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
        modelValue: (__VLS_ctx.fromDate),
        placeholder: "From date",
        maxDate: (__VLS_ctx.today),
    }));
    const __VLS_33 = __VLS_32({
        modelValue: (__VLS_ctx.fromDate),
        placeholder: "From date",
        maxDate: (__VLS_ctx.today),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_35 = {}.Datepicker;
    /** @type {[typeof __VLS_components.Datepicker, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        modelValue: (__VLS_ctx.toDate),
        placeholder: "To date",
        maxDate: (__VLS_ctx.today),
    }));
    const __VLS_37 = __VLS_36({
        modelValue: (__VLS_ctx.toDate),
        placeholder: "To date",
        maxDate: (__VLS_ctx.today),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.selectedTags = [];
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_39 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        ...{ 'onTag': {} },
        modelValue: (__VLS_ctx.selectedTags),
        options: (__VLS_ctx.tagOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Tags",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onTag': {} },
        modelValue: (__VLS_ctx.selectedTags),
        options: (__VLS_ctx.tagOptions),
        multiple: (true),
        taggable: (true),
        searchable: (true),
        mode: "tags",
        placeholder: "Filter Tags",
        ...{ class: "multiselect tag-multiselect" },
        label: "name",
        trackBy: "code",
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_43;
    let __VLS_44;
    let __VLS_45;
    const __VLS_46 = {
        onTag: ((newTag) => {
            const tagObj = {
                name: newTag,
                code: newTag.replace(/[\s-]/g, '')
            };
            __VLS_ctx.addItem(tagObj, __VLS_ctx.tagOptions, __VLS_ctx.selectedTags, true);
        })
    };
    var __VLS_42;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block submit-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track submit-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.selectedTags = [];
                __VLS_ctx.fromDate = undefined;
                __VLS_ctx.toDate = undefined;
                __VLS_ctx.selectedGrades = [];
                __VLS_ctx.selectedSubjects = [];
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "delete-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        width: "15",
        height: "15",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        ...{ class: "lucide lucide-trash2-icon lucide-trash-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M10 11v6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M14 11v6",
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showFilters))
                    return;
                __VLS_ctx.applyFilters();
            } },
        ...{ class: "apply-btn" },
    });
}
if (__VLS_ctx.showSorts) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-dropdown" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block title-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSorts))
                    return;
                __VLS_ctx.selectedField = null;
                __VLS_ctx.applySort();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_47 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        modelValue: (__VLS_ctx.selectedField),
        options: (__VLS_ctx.fieldOptions),
        searchable: (true),
        placeholder: "Sort By",
        ...{ class: "multiselect tag-multiselect" },
    }));
    const __VLS_49 = __VLS_48({
        modelValue: (__VLS_ctx.selectedField),
        options: (__VLS_ctx.fieldOptions),
        searchable: (true),
        placeholder: "Sort By",
        ...{ class: "multiselect tag-multiselect" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSorts))
                    return;
                __VLS_ctx.selectedSort = null;
                __VLS_ctx.applySort();
            } },
        ...{ class: "reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-track" },
    });
    const __VLS_51 = {}.Multiselect;
    /** @type {[typeof __VLS_components.Multiselect, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        modelValue: (__VLS_ctx.selectedSort),
        options: (__VLS_ctx.sortOptions),
        searchable: (true),
        placeholder: "Asc/Desc",
        ...{ class: "multiselect tag-multiselect" },
    }));
    const __VLS_53 = __VLS_52({
        modelValue: (__VLS_ctx.selectedSort),
        options: (__VLS_ctx.sortOptions),
        searchable: (true),
        placeholder: "Asc/Desc",
        ...{ class: "multiselect tag-multiselect" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-block submit-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label-track submit-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSorts))
                    return;
                __VLS_ctx.selectedField = null;
                __VLS_ctx.selectedSort = null;
                __VLS_ctx.applySort();
            } },
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
        ...{ class: "lucide lucide-trash2-icon lucide-trash-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M10 11v6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M14 11v6",
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSorts))
                    return;
                __VLS_ctx.applySort();
            } },
        ...{ class: "apply-btn" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-container" },
});
for (const [docData] of __VLS_getVForSourceType((__VLS_ctx.filteredDocs))) {
    /** @type {[typeof BrowserCard, typeof BrowserCard, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(BrowserCard, new BrowserCard({
        ...{ 'onClick': {} },
        data: (docData[1]),
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onClick': {} },
        data: (docData[1]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_58;
    let __VLS_59;
    let __VLS_60;
    const __VLS_61 = {
        onClick: (...[$event]) => {
            __VLS_ctx.currentCardData = docData[1];
            __VLS_ctx.currentDocRef = docData[0];
            __VLS_ctx.openBrowserCardModal();
        }
    };
    var __VLS_57;
}
if (__VLS_ctx.toggleModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-book-expanded-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-book-expanded-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.toggleModal))
                    return;
                __VLS_ctx.closeBrowserCardModal();
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
    const __VLS_62 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        name: "fade-slide",
        mode: "out-in",
    }));
    const __VLS_64 = __VLS_63({
        name: "fade-slide",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
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
        (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].desc1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].desc2);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-container" },
    });
    if (__VLS_ctx.activeSlide === 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "confirmation-columns-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "confirmation-column" },
        });
        for (const [section, i] of __VLS_getVForSourceType((__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].sections.slice(0, 3)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-section" },
                key: (i),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "section-label" },
            });
            (section.label);
            for (const [dataComp, j] of __VLS_getVForSourceType((section.data))) {
                const __VLS_66 = ((dataComp.component));
                // @ts-ignore
                const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
                    key: (j),
                    ...(dataComp.props),
                }));
                const __VLS_68 = __VLS_67({
                    key: (j),
                    ...(dataComp.props),
                }, ...__VLS_functionalComponentArgsRest(__VLS_67));
                __VLS_69.slots.default;
                (__VLS_ctx.getText(dataComp));
                var __VLS_69;
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "confirmation-column" },
        });
        for (const [section, i] of __VLS_getVForSourceType((__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].sections.slice(3, 7)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-section" },
                key: (i),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "section-label" },
            });
            (section.label);
            for (const [dataComp, j] of __VLS_getVForSourceType((section.data))) {
                const __VLS_70 = ((dataComp.component));
                // @ts-ignore
                const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
                    key: (j),
                    ...(dataComp.props),
                }));
                const __VLS_72 = __VLS_71({
                    key: (j),
                    ...(dataComp.props),
                }, ...__VLS_functionalComponentArgsRest(__VLS_71));
                __VLS_73.slots.default;
                (__VLS_ctx.getText(dataComp));
                var __VLS_73;
            }
        }
    }
    if (__VLS_ctx.activeSlide === 2) {
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
                const __VLS_74 = ((dataComp.component));
                // @ts-ignore
                const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }));
                const __VLS_76 = __VLS_75({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_75));
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
                    if (!(__VLS_ctx.toggleModal))
                        return;
                    if (!(__VLS_ctx.activeSlide !== 3))
                        return;
                    __VLS_ctx.nextSlide();
                } },
            ...{ class: "proceed-btn" },
        });
    }
    if (__VLS_ctx.activeSlide === 1 || (__VLS_ctx.activeSlide == 2 && __VLS_ctx.windowWidth > 1025)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "images-half" },
        });
        if (__VLS_ctx.activeSlide === 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "images-carousel" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "images-wrapper" },
            });
            const __VLS_78 = {}.transition;
            /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
                name: (`fade-slide-${__VLS_ctx.direction}`),
                mode: "out-in",
            }));
            const __VLS_80 = __VLS_79({
                name: (`fade-slide-${__VLS_ctx.direction}`),
                mode: "out-in",
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            __VLS_81.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "image-wrapper" },
                key: (__VLS_ctx.images[__VLS_ctx.currentImageIndex]),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.images[__VLS_ctx.currentImageIndex]),
            });
            var __VLS_81;
        }
        if (__VLS_ctx.activeSlide === 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (__VLS_ctx.prevImage) },
                ...{ class: "chevron-left-images-carousel" },
                disabled: (__VLS_ctx.isLeftDisabled),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                ...{ class: "lucide lucide-chevron-left-icon lucide-chevron-left" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "m15 18-6-6 6-6",
            });
        }
        if (__VLS_ctx.activeSlide === 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (__VLS_ctx.nextImage) },
                ...{ class: "chevron-right-images-carousel" },
                disabled: (__VLS_ctx.isRightDisabled),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                ...{ class: "lucide lucide-chevron-right-icon lucide-chevron-right" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "m9 18 6-6-6-6",
            });
        }
    }
    var __VLS_65;
}
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
    const __VLS_82 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        name: "fade-in",
    }));
    const __VLS_84 = __VLS_83({
        name: "fade-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    __VLS_85.slots.default;
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
    var __VLS_85;
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['filters-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filters-box']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-button']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-arrow-down-wide-narrow-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-arrow-down-wide-narrow']} */ ;
/** @type {__VLS_StyleScopedClasses['option-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-button']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-funnel-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-funnel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['date-selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash2-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash-2']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-track']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-block']} */ ;
/** @type {__VLS_StyleScopedClasses['label-track']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-track']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash2-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-trash-2']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-book-expanded-container']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-book-expanded-content']} */ ;
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
/** @type {__VLS_StyleScopedClasses['confirmation-columns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-column']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-column']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
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
/** @type {__VLS_StyleScopedClasses['images-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['images-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['image-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['chevron-left-images-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-left-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-left']} */ ;
/** @type {__VLS_StyleScopedClasses['chevron-right-images-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-right-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-right']} */ ;
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
            BrowserCard: BrowserCard,
            Multiselect: Multiselect,
            Datepicker: Datepicker,
            Navbar: Navbar,
            fromDate: fromDate,
            toDate: toDate,
            filterButtonRef: filterButtonRef,
            sortButtonRef: sortButtonRef,
            subjectOptions: subjectOptions,
            fieldOptions: fieldOptions,
            selectedField: selectedField,
            sortOptions: sortOptions,
            selectedSort: selectedSort,
            applySort: applySort,
            selectedSubjects: selectedSubjects,
            gradeOptions: gradeOptions,
            selectedGrades: selectedGrades,
            selectedISBNs: selectedISBNs,
            tagOptions: tagOptions,
            selectedTags: selectedTags,
            searchQuery: searchQuery,
            showFilters: showFilters,
            showSorts: showSorts,
            today: today,
            filteredDocs: filteredDocs,
            toggleModal: toggleModal,
            currentDocRef: currentDocRef,
            currentCardData: currentCardData,
            currentImageIndex: currentImageIndex,
            images: images,
            isLeftDisabled: isLeftDisabled,
            isRightDisabled: isRightDisabled,
            direction: direction,
            prevImage: prevImage,
            nextImage: nextImage,
            activeSlide: activeSlide,
            slideIcons: slideIcons,
            progresses: progresses,
            nextSlide: nextSlide,
            getText: getText,
            slides: slides,
            deepUnref: deepUnref,
            toggleConfirmationModal: toggleConfirmationModal,
            selectedNotif: selectedNotif,
            openModal: openModal,
            possibleStates: possibleStates,
            activeState: activeState,
            acceptRequest: acceptRequest,
            applyFilters: applyFilters,
            denyRequest: denyRequest,
            addItem: addItem,
            openBrowserCardModal: openBrowserCardModal,
            closeBrowserCardModal: closeBrowserCardModal,
            closeModal: closeModal,
            windowWidth: windowWidth,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
