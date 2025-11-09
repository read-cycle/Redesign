/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import Multiselect from 'vue-multiselect';
import Navbar from '../components/Navbar.vue';
import { onMounted, ref, watch, computed, isRef, onBeforeUnmount } from 'vue';
import bookSVG from '../assets/icons/book.svg';
import priceSVG from '../assets/icons/pricing.svg';
import boxSVG from '../assets/icons/box.svg';
import infoSVG from '../assets/icons/info.svg';
import photoSVG from '../assets/icons/photo.svg';
import ImageUploader from './ImageUploader.vue';
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import ISBN from 'isbn-utils';
import { auth, db, storage } from '../firebase-init';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, DocumentReference, setDoc, where, query, getDocs, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRoute, useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import { sendEmail } from '../sendEmail';
import { isbnToTitle, titleToIsbn, isbnToSubject, titleToSubject, isbnToGrade, titleToGrade } from "../assets/BookMappings";
console.log(isbnToGrade);
let displayName = null;
let userID = null;
let userEmail = null;
async function autofillUserData() {
    if (!userID || !displayName)
        return;
    const snap = await getDoc(doc(db, "users", userID));
    uploaderName.value = displayName;
    if (snap.exists()) {
        const data = snap.data();
        contactPreference.value = data.contactPreferences;
        deliveryPreference.value = data.deliveryPreferences;
    }
}
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userID = user.uid;
        userEmail = user.email;
        displayName = user.displayName;
        await autofillUserData();
    }
    else {
        router.push('/login');
    }
});
const activeSlide = ref(1);
const route = useRoute();
const router = useRouter();
if (route.query.slide) {
    const slideNum = parseInt(route.query.slide, 10);
    if (!isNaN(slideNum))
        activeSlide.value = slideNum;
}
watch(activeSlide, (val) => {
    router.replace({
        query: {
            ...route.query,
            slide: val.toString()
        }
    });
});
const slideIcons = [bookSVG, priceSVG, infoSVG, boxSVG, photoSVG];
const progresses = ref([0, 0, 0, 100, 0]);
const isISBNDisabled = ref(false);
const isTitleDisabled = ref(false);
const ISBNOptions = ref(Object.keys(isbnToTitle).map(key => ({
    name: key,
    code: key
})));
const selectedISBN = ref();
watch(selectedISBN, (newISBN) => {
    if (newISBN == null) {
        isTitleDisabled.value = false;
        return;
    }
    else if (isISBNDisabled.value == false) {
        isTitleDisabled.value = true;
        selectedTitle.value = null;
    }
    else {
        return;
    }
    if (isbnToSubject[newISBN.code]) {
        const subject = isbnToSubject[newISBN.code];
        selectedSubject.value = {
            name: subject,
            code: subject.toLowerCase().replace(/\s+/g, '-')
        };
    }
    if (isbnToGrade[newISBN.code]) {
        const grade = isbnToGrade[newISBN.code].toLowerCase();
        console.log("GRADE");
        console.log(grade);
        let gradeName = grade;
        if (grade.startsWith("g")) {
            gradeName = `Grade ${grade.slice(1)}`;
        }
        else if (grade === "bp") {
            gradeName = "Bridge Program";
        }
        selectedGrade.value = {
            name: gradeName,
            code: grade
        };
    }
    if (isbnToTitle[newISBN.code]) {
        const title = isbnToTitle[newISBN.code];
        selectedTitle.value = {
            name: title,
            code: title.toLowerCase().replace(/\s+/g, '-')
        };
        return;
    }
    const raw = newISBN?.code?.replace(/[-\s]/g, '');
    if (ISBN.isValid(raw)) {
        const isbnObj = ISBN.parse(raw);
        const isbn13 = isbnObj.asIsbn13();
        console.log('Valid ISBN:', isbn13);
        fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`)
            .then(res => res.json())
            .then(data => {
            if (data.totalItems > 0) {
                const book = data.items[0].volumeInfo;
                const title = book.title;
                selectedTitle.value = {
                    name: title,
                    code: title.toLowerCase().replace(/\s+/g, '-')
                };
            }
            else {
                console.log('No book found for this ISBN');
                selectedTitle.value = null;
            }
        })
            .catch(err => {
            console.error('Error fetching from Google Books:', err);
            selectedTitle.value = null;
        });
    }
    else {
        console.log('Invalid ISBN');
        selectedTitle.value = null;
    }
});
const selectedTitle = ref();
watch(selectedTitle, (newTitle) => {
    console.log("NEW TITLE");
    console.log(newTitle);
    if (newTitle == null) {
        isISBNDisabled.value = false;
        return;
    }
    else if (isTitleDisabled.value == false) {
        isISBNDisabled.value = true;
        selectedISBN.value = null;
    }
    else {
        return;
    }
    if (titleToIsbn[newTitle.name]) {
        const isbn = titleToIsbn[newTitle.name];
        selectedISBN.value = {
            name: isbn,
            code: isbn.replace('-', '')
        };
    }
    if (titleToSubject[newTitle.name]) {
        const subject = titleToSubject[newTitle.name];
        selectedSubject.value = {
            name: subject,
            code: subject.toLowerCase().replace(/\s+/g, '-')
        };
    }
    if (titleToGrade[newTitle.name]) {
        const grade = titleToGrade[newTitle.name].toLowerCase();
        console.log(grade);
        let gradeName = grade;
        if (grade.startsWith("g")) {
            gradeName = `Grade ${grade.slice(1)}`;
        }
        else if (grade === "bp") {
            gradeName = "Bridge Program";
        }
        selectedGrade.value = {
            name: gradeName,
            code: grade
        };
    }
});
const gradeOptions = ref([
    { name: 'Grade 1', code: '1' },
    { name: 'Grade 2', code: '2' },
    { name: 'Grade 3', code: '3' },
    { name: 'Grade 4', code: '4' },
    { name: 'Grade 5', code: '5' },
    { name: 'Grade 6', code: '6' },
    { name: 'Grade 7', code: '7' },
    { name: 'Grade 8', code: '8' },
    { name: 'Grade 9', code: '9' },
    { name: 'Grade 10', code: '10' },
    { name: 'Grade 11 AS', code: '11' },
    { name: 'Grade 12 AS', code: '12' },
    { name: 'Bridge Program', code: 'bp' }
]);
const selectedGrade = ref();
const subjectOptions = ref(Array.from(new Set(Object.values(isbnToSubject))).map((val) => ({
    name: val,
    code: val.toLowerCase().replace(/\s+/g, '-')
})));
const selectedSubject = ref();
const titleOptions = ref(Object.keys(titleToIsbn).map(key => ({
    name: key,
    code: key.toLowerCase().replace(/\s+/g, '-')
})));
let tagOptions = ref([
    { name: "Cambridge", code: "cambridge" },
    { name: "Oxford", code: "oxford" },
    { name: "Hodder", code: "hodder" },
    { name: "Viva", code: "viva" },
    { name: "Saral", code: "saral" },
    { name: "Collins", code: "collins" },
    { name: "Primary", code: "primary" },
    { name: "Lower Secondary", code: "lower-secondary" },
    { name: "IGCSE", code: "igcse" },
    { name: "AS Level", code: "as-level" },
    { name: "A Level", code: "a-level" },
    { name: "Bridge Program", code: "bridge-program" },
    { name: "Coursebook", code: "coursebook" },
    { name: "Learner's Book", code: "learners-book" },
    { name: "Activity Book", code: "activity-book" },
    { name: "Workbook", code: "workbook" },
    { name: "Exam Preparation", code: "exam-preparation" },
    { name: "Digital Access", code: "digital-access" }
]);
let selectedTags = ref([]);
const conditionOptions = ref([
    { name: "new", code: "new" },
    { name: "like new", code: "like-new" },
    { name: "very good", code: "very-good" },
    { name: "good", code: "good" },
    { name: "acceptable", code: "acceptable" },
    { name: "used", code: "used" }
]);
const selectedCondition = ref();
const priceMode = ref();
const priceOptions = ref([
    { name: 'Free', code: 'free' },
    { name: 'Priced', code: 'priced' }
]);
const conditionDetailTags = ref([
    { name: "no markings", code: "no-markings" },
    { name: "highlighted", code: "highlighted" },
    { name: "annotated", code: "annotated" },
    { name: "dog-eared", code: "dog-eared" },
    { name: "torn pages", code: "torn-pages" },
    { name: "loose binding", code: "loose-binding" },
    { name: "stained", code: "stained" },
    { name: "water damaged", code: "water-damaged" },
    { name: "faded cover", code: "faded-cover" },
    { name: "creased cover", code: "creased-cover" },
    { name: "yellowed pages", code: "yellowed-pages" },
    { name: "missing cover", code: "missing-cover" },
    { name: "sticker residue", code: "sticker-residue" },
    { name: "worn edges", code: "worn-edges" },
    { name: "school stamp", code: "school-stamp" },
    { name: "missing pages", code: "missing-pages" },
    { name: "missing CD", code: "missing-cd" },
    { name: "name written inside", code: "name-written-inside" }
]);
const conditionDetails = ref([]);
const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }];
const deliveryPreference = ref([]);
const price = ref(0);
const quantity = ref(0);
const uploaderName = ref('');
const contactPreferenceOptions = [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }];
const contactPreference = ref([]);
const listingImage = ref(null);
const extraImages = ref(null);
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
                                    code: newTag.toLowerCase().replace(/[\s-]/g, '')
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
                            placeholder: 'Enter Grade',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                        }
                    }
                ]
            },
            {
                label: 'Subject',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "subjectMS",
                            name: "subjectMS",
                            modelValue: selectedSubject,
                            'onUpdate:modelValue': (val) => selectedSubject.value = val,
                            options: subjectOptions,
                            searchable: true,
                            placeholder: 'Enter Subject',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code'
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
            }
        ]
    },
    {
        header: 'Pricing & Condition',
        sections: [
            {
                label: 'Condition',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "conditionMS",
                            name: "conditionMS",
                            modelValue: selectedCondition,
                            'onUpdate:modelValue': (val) => selectedCondition.value = val,
                            options: conditionOptions,
                            searchable: true,
                            taggable: true,
                            placeholder: 'Select Condition',
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                            onTag: (newTag) => {
                                const tagObj = {
                                    name: newTag,
                                    code: newTag.replace(/[\s-]/g, '')
                                };
                                if (selectedCondition.value) {
                                    addItem(tagObj, conditionOptions, selectedCondition, false);
                                }
                            }
                        }
                    }
                ]
            },
            {
                label: 'Condition (Tags)',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            id: "conditionTags",
                            name: "conditionTags",
                            modelValue: conditionDetails,
                            'onUpdate:modelValue': (val) => conditionDetails.value = val,
                            options: conditionDetailTags,
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
                                addItem(tagObj, conditionDetailTags, conditionDetails, true);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Free or Priced',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            modelValue: priceMode,
                            'onUpdate:modelValue': (val) => priceMode.value = val,
                            options: priceOptions,
                            class: 'multiselect',
                            label: 'name',
                            trackBy: 'code',
                            placeholder: 'Select pricing type'
                        }
                    }
                ]
            },
            {
                label: 'Price per unit (₹)',
                data: [
                    {
                        component: 'input',
                        props: {
                            value: price,
                            onInput: (e) => price.value = +e.target.value,
                            type: 'number',
                            placeholder: 'Enter your price',
                            min: 0,
                            class: 'form-input price-input',
                            disabled: computed(() => priceMode?.value?.code === 'free')
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
                            value: quantity,
                            onInput: (e) => quantity.value = +e.target.value,
                            type: 'number',
                            placeholder: 'Enter your quantity',
                            min: 0,
                            class: 'form-input quantity-input'
                        }
                    }
                ]
            }
        ]
    },
    {
        header: 'Your Info',
        sections: [
            {
                label: 'Display Name',
                data: [
                    {
                        component: 'input',
                        props: {
                            type: 'text',
                            value: uploaderName,
                            onInput: (e) => uploaderName.value = e.target.value,
                            placeholder: 'Enter your display name',
                            class: 'form-input'
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
                            modelValue: contactPreference,
                            'onUpdate:modelValue': (val) => contactPreference.value = val,
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
            },
            {
                label: 'Delivery Preference',
                data: [
                    {
                        component: Multiselect,
                        props: {
                            modelValue: deliveryPreference,
                            'onUpdate:modelValue': (val) => deliveryPreference.value = val,
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
            }
        ]
    },
    {
        header: 'Miscellaneous',
        sections: [
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
        header: 'Photos',
        sections: [
            {
                label: 'Listing Image',
                data: [
                    {
                        component: ImageUploader,
                        props: {
                            modelValue: listingImage,
                            'onUpdate:modelValue': (val) => listingImage.value = val,
                            required: true,
                            placeholder: 'Upload listing image',
                            class: 'image-uploader',
                            multiple: false
                        }
                    }
                ]
            },
            {
                label: 'Extra Images',
                data: [
                    {
                        component: ImageUploader,
                        props: {
                            modelValue: extraImages,
                            'onUpdate:modelValue': (val) => extraImages.value = val,
                            multiple: true,
                            required: false,
                            placeholder: 'Upload extra images',
                            class: 'image-uploader'
                        }
                    }
                ]
            }
        ]
    },
    {
        header: 'Confirmation',
        sections: [
            {
                label: 'Book Details',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Title: ${selectedTitle.value?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Grade: ${selectedGrade.value?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Tags: ${selectedTags.value.length ? selectedTags.value.map(tag => tag.name).join(', ') : 'None'}`),
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
                            text: computed(() => `Condition: ${selectedCondition.value?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Condition Details: ${conditionDetails.value.length ? conditionDetails.value.map(tag => tag.name).join(', ') : 'None'}`),
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
                            text: computed(() => `Price Mode: ${priceMode.value?.name || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Price: ${price.value != null ? `₹${price.value}` : 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Quantity: ${quantity.value != null ? quantity.value : 'Not specified'}`),
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
                            text: computed(() => `Delivery Preference: ${deliveryPreference.value.length
                                ? deliveryPreference.value.map(tag => tag.name).join(', ')
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
                            text: computed(() => `Uploader Name: ${uploaderName.value || 'Not specified'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Contact Preference: ${contactPreference.value.length ? contactPreference.value.map(tag => tag.name).join(', ') : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            },
            {
                label: 'Photos',
                data: [
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Listing Image: ${listingImage.value?.name || 'Not uploaded'}`),
                            class: 'confirmation-field'
                        }
                    },
                    {
                        component: 'p',
                        props: {
                            text: computed(() => `Extra Images: ${Array.isArray(extraImages.value) && extraImages.value.length
                                ? extraImages.value.map(img => img.name).join(', ')
                                : 'None'}`),
                            class: 'confirmation-field'
                        }
                    }
                ]
            }
        ]
    }
];
function nextSlide() {
    setTimeout(() => {
        activeSlide.value++;
    }, 375);
}
async function submitData() {
    if (progresses.value.every(x => x >= 100)) {
        try {
            const docRef = await addDoc(collection(db, "uploadPool"), {
                isbn: selectedISBN.value || null,
                title: selectedTitle.value || null,
                grade: selectedGrade.value || null,
                tags: selectedTags.value || [],
                condition: selectedCondition.value || null,
                priceMode: priceMode.value || null,
                conditionDetails: conditionDetails.value || [],
                deliveryPreference: deliveryPreference.value || "",
                price: price.value || 0,
                quantity: quantity.value || 0,
                uploaderName: uploaderName.value || "",
                contactPreference: contactPreference.value || "",
                extraInfo: extraInfo.value || "",
                uploaderID: userID,
                uploaderEmail: userEmail
            });
            const listingImageUrls = [];
            const extraImagesUrls = [];
            if (listingImage.value) {
                const listingImageRef = storageRef(storage, `uploadPool/${docRef.id}/listingImage/${listingImage.value.name}`);
                await uploadBytes(listingImageRef, listingImage.value);
                const url = await getDownloadURL(listingImageRef);
                listingImageUrls.push(url);
            }
            if (extraImages.value && extraImages.value.length > 0) {
                for (const file of extraImages.value) {
                    const extraImageRef = storageRef(storage, `uploadPool/${docRef.id}/extraImages/${file.name}`);
                    await uploadBytes(extraImageRef, file);
                    const url = await getDownloadURL(extraImageRef);
                    extraImagesUrls.push(url);
                }
            }
            await updateDoc(doc(db, "uploadPool", docRef.id), {
                listingImage: listingImageUrls,
                extraImages: extraImagesUrls,
                timestamp: serverTimestamp()
            });
            const watchlistQuery = query(collection(db, 'watchlist'), where('isbn.code', '==', selectedISBN.value.code));
            let watchlistData = [];
            getDocs(watchlistQuery).then((result) => {
                watchlistData = result.docs.map((doc) => {
                    const data = doc.data();
                    return [doc.ref, { id: doc.id, ...data }];
                });
                watchlistData.forEach((item) => {
                    sendEmail(item[1].buyerEmail, 'ReadCycle Confirmation Email', '<h1>Hello</h1>');
                });
            });
            window.alert("Submit Successful.");
        }
        catch (err) {
            console.error("Error uploading:", err);
            window.alert("Upload failed.");
        }
    }
    else {
        window.alert("Please fill in all required fields");
        console.log(progresses.value);
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
onMounted(() => {
    watch([selectedISBN, selectedTitle, selectedGrade, selectedTags, selectedCondition, conditionDetails, priceMode, price, quantity, deliveryPreference, uploaderName, contactPreference, listingImage, extraImages], ([newISBN, newTitle, newGrade, newTags, newCondition, newConditionDetails, newPriceMode, newPrice, newQuantity, newDeliveryPreference, newUploaderName, newContactPreference, newListingImage, newExtraImages], [oldISBN, oldTitle, oldGrade, oldTags, oldCondition, oldConditionDetails, oldPriceMode, oldPrice, oldQuantity, oldDeliveryPreference, oldUploaderName, oldContactPreference, oldListingImage, oldExtraImages]) => {
        if (newISBN && !oldISBN)
            progresses.value[0] += 25;
        if (!newISBN && oldISBN)
            progresses.value[0] -= 25;
        if (newTitle && !oldTitle)
            progresses.value[0] += 25;
        if (!newTitle && oldTitle)
            progresses.value[0] -= 25;
        if (newGrade && !oldGrade)
            progresses.value[0] += 25;
        if (!newGrade && oldGrade)
            progresses.value[0] -= 25;
        if (newCondition && !oldCondition)
            progresses.value[1] += 20;
        if (!newCondition && oldCondition)
            progresses.value[1] -= 20;
        const newConditionDetailsLen = newConditionDetails.length;
        const oldConditionDetailsLen = oldConditionDetails.length;
        if (newConditionDetailsLen > 0 && oldConditionDetailsLen === 0)
            progresses.value[1] += 20;
        if (newConditionDetailsLen === 0 && oldConditionDetailsLen > 0)
            progresses.value[1] -= 20;
        if (newPriceMode && !oldPriceMode)
            progresses.value[1] += 20;
        if (!newPriceMode && oldPriceMode)
            progresses.value[1] -= 20;
        if (newPriceMode && !oldPriceMode && newPriceMode?.code === 'free') {
            progresses.value[1] += 20;
        }
        else if (oldPriceMode?.code === 'free' && newPriceMode?.code !== 'free') {
            progresses.value[1] -= 20;
        }
        if (newPrice && !oldPrice)
            progresses.value[1] += 20;
        if (!newPrice && oldPrice)
            progresses.value[1] -= 20;
        if (newQuantity && !oldQuantity)
            progresses.value[1] += 20;
        if (!newQuantity && oldQuantity)
            progresses.value[1] -= 20;
        if (newUploaderName && !oldUploaderName)
            progresses.value[2] += 100 / 3;
        if (!newUploaderName && oldUploaderName)
            progresses.value[2] -= 100 / 3;
        const newContactPreferenceLen = Array.isArray(newContactPreference) ? newContactPreference.length : 0;
        const oldContactPreferenceLen = Array.isArray(oldContactPreference) ? oldContactPreference.length : 0;
        if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0)
            progresses.value[2] += 100 / 3;
        if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0)
            progresses.value[2] -= 100 / 3;
        const newDeliveryLen = newDeliveryPreference.length;
        const oldDeliveryLen = oldDeliveryPreference.length;
        if (newDeliveryLen > 0 && oldDeliveryLen === 0)
            progresses.value[2] += 100 / 3;
        if (newDeliveryLen === 0 && oldDeliveryLen > 0)
            progresses.value[2] -= 100 / 3;
        if (newListingImage && !oldListingImage)
            progresses.value[4] += 50;
        if (!newListingImage && oldListingImage)
            progresses.value[4] -= 50;
        const newExtraImagesLen = Array.isArray(newExtraImages) ? newExtraImages.length : 0;
        const oldExtraImagesLen = Array.isArray(oldExtraImages) ? oldExtraImages.length : 0;
        if (newExtraImagesLen > 0 && oldExtraImagesLen === 0)
            progresses.value[4] += 50;
        if (newExtraImagesLen === 0 && oldExtraImagesLen > 0)
            progresses.value[4] -= 50;
        const newTagsLen = newTags.length;
        const oldTagsLen = oldTags.length;
        if (newTagsLen > 0 && oldTagsLen === 0)
            progresses.value[0] += 25;
        if (newTagsLen === 0 && oldTagsLen > 0)
            progresses.value[0] -= 25;
    });
});
function getText(dataComp) {
    return dataComp.props.text.value;
}
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
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-field']} */ ;
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
    ...{ class: "grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metabar-container" },
});
/** @type {[typeof MetaBar, typeof MetaBar, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(MetaBar, new MetaBar({
    ...{ 'onNotifClick': {} },
    title: ('Upload'),
    ref: "metaBar",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onNotifClick': {} },
    title: ('Upload'),
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
    ...{ class: "upload-container" },
});
const __VLS_15 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    name: "fade",
    mode: "out-in",
}));
const __VLS_17 = __VLS_16({
    name: "fade",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
if (__VLS_ctx.activeSlide !== 6) {
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
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: __VLS_ctx.progresses[__VLS_ctx.activeSlide - 1] + '%' }) },
    });
}
var __VLS_18;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-container" },
});
const __VLS_19 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    name: "slide-fade",
    mode: "out-in",
}));
const __VLS_21 = __VLS_20({
    name: "slide-fade",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
if (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1]) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slide-container" },
        key: (__VLS_ctx.activeSlide),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "text-container-header" },
    });
    (__VLS_ctx.slides[__VLS_ctx.activeSlide - 1].header);
    if (__VLS_ctx.activeSlide == 6) {
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
                const __VLS_23 = ((dataComp.component));
                // @ts-ignore
                const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
                    key: (j),
                    ...(dataComp.props),
                }));
                const __VLS_25 = __VLS_24({
                    key: (j),
                    ...(dataComp.props),
                }, ...__VLS_functionalComponentArgsRest(__VLS_24));
                __VLS_26.slots.default;
                (__VLS_ctx.getText(dataComp));
                var __VLS_26;
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
                const __VLS_27 = ((dataComp.component));
                // @ts-ignore
                const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
                    key: (j),
                    ...(dataComp.props),
                }));
                const __VLS_29 = __VLS_28({
                    key: (j),
                    ...(dataComp.props),
                }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                __VLS_30.slots.default;
                (__VLS_ctx.getText(dataComp));
                var __VLS_30;
            }
        }
    }
    if (__VLS_ctx.activeSlide != 6) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-wrapper-normal" },
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
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-content" },
            });
            for (const [dataComp, j] of __VLS_getVForSourceType((section.data))) {
                const __VLS_31 = ((dataComp.component));
                // @ts-ignore
                const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }));
                const __VLS_33 = __VLS_32({
                    key: (j),
                    ...(__VLS_ctx.deepUnref(dataComp.props)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            }
        }
    }
    if (__VLS_ctx.activeSlide != 6) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-section button-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.slides[__VLS_ctx.activeSlide - 1]))
                        return;
                    if (!(__VLS_ctx.activeSlide != 6))
                        return;
                    __VLS_ctx.nextSlide();
                } },
            ...{ class: "next-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            ...{ class: "lucide lucide-chevrons-right-icon lucide-chevrons-right" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m6 17 5-5-5-5",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "m13 17 5-5-5-5",
        });
    }
    if (__VLS_ctx.activeSlide == 6) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-section button-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.slides[__VLS_ctx.activeSlide - 1]))
                        return;
                    if (!(__VLS_ctx.activeSlide == 6))
                        return;
                    __VLS_ctx.submitData();
                } },
            ...{ class: "next-btn" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "graphic-container" },
    });
}
var __VLS_22;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-number-change" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-number-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeSlide > 1 && __VLS_ctx.activeSlide--;
        } },
    ...{ class: "nav-left" },
    ...{ class: ({ disabled: __VLS_ctx.activeSlide <= 1 }) },
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
    ...{ class: "lucide lucide-chevron-left-icon lucide-chevron-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m15 18-6-6 6-6",
});
for (const [i] of __VLS_getVForSourceType((6))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeSlide = i;
            } },
        ...{ class: "slide-number-selection" },
        key: (i),
        ...{ class: ({ active: __VLS_ctx.activeSlide == i }) },
    });
    (i);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeSlide < 6 && __VLS_ctx.activeSlide++;
        } },
    ...{ class: "nav-right" },
    ...{ class: ({ disabled: __VLS_ctx.activeSlide >= 6 }) },
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
    ...{ class: "lucide lucide-chevron-right-icon lucide-chevron-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "m9 18 6-6-6-6",
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
    const __VLS_35 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        name: "fade-in",
    }));
    const __VLS_37 = __VLS_36({
        name: "fade-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_38.slots.default;
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
    var __VLS_38;
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metabar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-container']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text-container-header']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-columns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-column']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['confirmation-column']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['data-wrapper-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['section-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['next-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevrons-right-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevrons-right']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
/** @type {__VLS_StyleScopedClasses['next-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number-change']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number-list']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-left']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-left-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lucide-chevron-left']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-number-selection']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-right']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
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
            Navbar: Navbar,
            Sidebar: Sidebar,
            MetaBar: MetaBar,
            activeSlide: activeSlide,
            slideIcons: slideIcons,
            progresses: progresses,
            slides: slides,
            nextSlide: nextSlide,
            submitData: submitData,
            getText: getText,
            deepUnref: deepUnref,
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
