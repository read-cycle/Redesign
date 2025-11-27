<script setup lang="ts">
import Multiselect from 'vue-multiselect'
import Navbar from '../components/Navbar.vue';
import {  onMounted, ref, watch, type Ref, computed, isRef, type ComputedRef  } from 'vue';
import bookSVG from '../assets/icons/book.svg'
import priceSVG from '../assets/icons/pricing.svg'
import boxSVG from '../assets/icons/box.svg'
import infoSVG from '../assets/icons/info.svg'
import photoSVG from '../assets/icons/photo.svg'
import bookCheckSVG from '../assets/icons/book-check.svg';
import bigCheckSVG from '../assets/icons/check-big.svg';
import openBoxSVG from '../assets/icons/package-open.svg';
import communityOutreachSVG from '../assets/icons/user-check.svg';
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import ISBN from 'isbn-utils';
import { auth, db } from '../firebase-init'
import { collection, addDoc, doc, serverTimestamp, deleteDoc, DocumentReference, setDoc } from "firebase/firestore"; 
import { useRoute, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import type { BuyerRequestedDoc } from '../interfaces';
import { isbnToTitle, titleToIsbn, isbnToSubject, titleToSubject, isbnToGrade, titleToGrade } from "BookMappings";

let displayName: string | null = null;
let userID: string | null = null;
let userEmail: string | null = null;

async function autofillUserData() {
  if(!userID || !displayName) return

  uploaderName.value = displayName;
}

onAuthStateChanged(auth, async(user: User | null) => {
  if (user) {
    userID = user.uid;
    userEmail = user.email;
    displayName = user.displayName;
    await autofillUserData()
  } else {
    router.push('/login')
  }
})

const activeSlide = ref(1);

const route = useRoute()
const router = useRouter()

if (route.query.slide) {
  const slideNum = parseInt(route.query.slide as string, 10)
  if (!isNaN(slideNum)) activeSlide.value = slideNum
}

watch(activeSlide, (val: number) => {
  router.replace({
    query: {
      ...route.query,
      slide: val.toString()
    }
  })
})

const slideIcons = [bookSVG, priceSVG, infoSVG, boxSVG, photoSVG, bookCheckSVG]

const progresses: Ref<number[]> = ref([0, 0, 0, 100])

const ISBNOptions = ref(
  Object.keys(isbnToTitle).map(key => ({
    name: key,
    code: key
  }))
);

type selectedItem = { name: string; code: string; };

const selectedISBN: Ref<selectedItem | null> = ref(null);
const selectedTitle: Ref<selectedItem | null> = ref(null);
const selectedGrade: Ref<selectedItem | null> = ref(null);
const selectedSubject: Ref<selectedItem | null> = ref(null);

const isTitleLoading: Ref<boolean> = ref(false);

watch(selectedISBN, (newISBN: selectedItem | null) => {

  if(!newISBN) return;

  if(isbnToSubject[newISBN.code] && selectedSubject.value == null) {
    const subject: string = isbnToSubject[newISBN.code];
    selectedSubject.value = {
      name: subject,
      code: subject.toLowerCase().replace(/\s+/g, '-')
    }
  }

  if (isbnToGrade[newISBN.code] && selectedGrade.value == null) {
    const grade: string = isbnToGrade[newISBN.code].toLowerCase();

    let gradeName = grade;

    if (grade.startsWith("g")) {
      gradeName = `Grade ${grade.slice(1)}`;
    } else if (grade === "bp") {
      gradeName = "Bridge Program";
    }

    selectedGrade.value = {
      name: gradeName,
      code: grade
    };
  }

  if(selectedTitle.value == null) {
    isTitleLoading.value = true;
    if(isbnToTitle[newISBN.code]) {
      const title: string = isbnToTitle[newISBN.code];
      selectedTitle.value = {
        name: title,
        code: title.toLowerCase().replace(/\s+/g, '-')
      };
      isTitleLoading.value = false;
      return
    }

  const raw = newISBN?.code?.replace(/[-\s]/g, '');
  
  if (ISBN.isValid(raw)) {
    const isbnObj = ISBN.parse(raw) as ISBN.ISBN;
    const isbn13 = isbnObj.asIsbn13();
    console.log('Valid ISBN:', isbn13);
  
    const googleURL = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`;
    const openLibURL = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&jscmd=data&format=json`;
  
    fetch(googleURL)
      .then(res => res.json())
      .then(data => {
        console.log("Google Books response:", data);
      
        if (data.totalItems > 0) {
          const book = data.items[0].volumeInfo;
          const title = book.title;
        
          selectedTitle.value = {
            name: title,
            code: title.toLowerCase().replace(/\s+/g, '-')
          };
        } else {
          console.log("Google Books: No items found. Trying Open Library...");
          return fetch(openLibURL)
            .then(res => res.json())
            .then(olData => {
              console.log("Open Library response:", olData);
            
              const key = `ISBN:${isbn13}`;
              if (olData[key]?.title) {
                const title = olData[key].title;
                selectedTitle.value = {
                  name: title,
                  code: title.toLowerCase().replace(/\s+/g, '-')
                };
              } else {
                console.log("Open Library: No book found.");
                selectedTitle.value = null;
              }
            });
        }
      })
      .catch(err => {
        console.error("Google Books error:", err);
        console.log("Falling back to Open Library...");
      
        fetch(openLibURL)
          .then(res => res.json())
          .then(olData => {
            const key = `ISBN:${isbn13}`;
            if (olData[key]?.title) {
              const title = olData[key].title;
              selectedTitle.value = {
                name: title,
                code: title.toLowerCase().replace(/\s+/g, '-')
              };
            } else {
              console.log("Open Library also failed.");
              selectedTitle.value = null;
            }
          })
          .catch(err => {
            console.error("Both ISBN lookups failed:", err);
            selectedTitle.value = null;
          });
      });
    
  } else {
    console.log('Invalid ISBN');
    selectedTitle.value = null;
  }
  isTitleLoading.value = false;
  }
});

watch(selectedTitle, (newTitle: selectedItem | null) => {

  if(!newTitle) return;
  
  if(titleToIsbn[newTitle.name] && selectedISBN.value == null) {
    const isbn: string = titleToIsbn[newTitle.name];
    selectedISBN.value = {
      name: isbn,
      code: isbn.replace('-', '')
    };
  }

  if(titleToSubject[newTitle.name] && selectedSubject.value == null) {
    const subject: string = titleToSubject[newTitle.name];
    selectedSubject.value = {
      name: subject,
      code: subject.toLowerCase().replace(/\s+/g, '-')
    }
  }

  if (titleToGrade[newTitle.name] && selectedGrade.value == null) {
    const grade: string = titleToGrade[newTitle.name].toLowerCase();

    console.log(grade)

    let gradeName = grade;

    if (grade.startsWith("g")) {
      gradeName = `Grade ${grade.slice(1)}`;
    } else if (grade === "bp") {
      gradeName = "Bridge Program";
    }

    selectedGrade.value = {
      name: gradeName,
      code: grade
    };
  }
})

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

const subjectOptions = ref(
  Array.from(new Set(Object.values(isbnToSubject))).map((val) => ({
    name: val as string,
    code: (val as string).toLowerCase().replace(/\s+/g, '-')
  }))
);

const titleOptions = ref(
  Object.keys(titleToIsbn).map(key => ({
    name: key,
    code: key.toLowerCase().replace(/\s+/g, '-')
  }))
);

const conditionOptions: Ref<{name: string, code: string}[]> = ref([
  { name: "new", code: "new" },
  { name: "like new", code: "like-new" },
  { name: "very good", code: "very-good" },
  { name: "good", code: "good" },
  { name: "acceptable", code: "acceptable" },
  { name: "used", code: "used" }
]);

const selectedCondition: Ref<{name: string, code: string} | undefined> = ref();

const quantity = ref(0);

const uploaderName = ref('');

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
              'onUpdate:modelValue': (val: selectedItem) => selectedISBN.value = val,
              options: ISBNOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Enter ISBN',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.replace(/[\s-]/g, '')
                }
                addItem(tagObj, ISBNOptions, selectedISBN, false)
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
              'onUpdate:modelValue': (val: selectedItem) => selectedTitle.value = val,
              options: titleOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Enter Book Title',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              loading: isTitleLoading,
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.toLowerCase().replace(/[\s-]/g, '')
                }
                addItem(tagObj, titleOptions, selectedTitle, false)
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
              'onUpdate:modelValue': (val: selectedItem) => selectedGrade.value = val,
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
              'onUpdate:modelValue': (val: selectedItem) => selectedSubject.value = val,
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
              'onUpdate:modelValue': (val: selectedItem) => selectedCondition.value = val,
              options: conditionOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Select Condition',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.replace(/[\s-]/g, '')
                }
                if (selectedCondition.value) {
                  addItem(tagObj, conditionOptions, selectedCondition, false);
                }              
              }
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
              onInput: (e: Event) => quantity.value = +(e.target as HTMLInputElement).value,
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
              onInput: (e: Event) => uploaderName.value = (e.target as HTMLInputElement).value,
              placeholder: 'Enter your display name',
              class: 'form-input'
            }
          }
        ]
      },
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
              onInput: (e: Event) => extraInfo.value = (e.target as HTMLInputElement).value,
              type: 'text',
              min: 0
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
              text: computed(() => `ISBN: ${selectedISBN.value?.name || 'Not specified'}`),
              class: 'confirmation-field'
            }
          },
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
              text: computed(() => `Subject: ${selectedSubject.value?.name || 'Not specified'}`),
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
          }
        ]
      },
      {
        label: 'Pricing & Quantity',
        data: [
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
        label: 'Contact',
        data: [
          {
            component: 'p',
            props: {
              text: computed(() => `Uploader Name: ${uploaderName.value || 'Not specified'}`),
              class: 'confirmation-field'
            }
          },
        ]
      },
    ]
  },
  {
    header: "Upload Complete!"
  }
]

//TODO: Add final page detailing 3 steps on how to donate
//TODO: Add final page for Upload Page
//TODO: Add loaders

function nextSlide() {
  setTimeout(() => {
    activeSlide.value++;
  }, 375)
}

async function submitData() {
  if (progresses.value.every((x: number) => x >= 100)) {
    try {
      await addDoc(collection(db, "donationPool"), {
        isbn: selectedISBN.value || null,
        title: selectedTitle.value || null,
        grade: selectedGrade.value || null,
        subject: selectedSubject.value || null,
        condition: selectedCondition.value || null,
        quantity: quantity.value || 0,
        uploaderName: uploaderName.value || "Anonymous",
        extraInfo: extraInfo.value || "",
        uploaderID: userID,
        uploaderEmail: userEmail,
        timestamp: serverTimestamp()
      });

      window.alert("Submit Successful.");

      activeSlide.value++;
    } catch (err) {
      console.error("Error uploading:", err);
      window.alert("Upload failed.");
    }
  } else {
    window.alert("Please fill in all required fields");
    console.log(progresses.value);
  }
}

onMounted(() => {
  watch(
    [selectedISBN, selectedTitle, selectedGrade, selectedSubject, selectedCondition, quantity, uploaderName],
    ([newISBN, newTitle, newGrade, newSubject, newCondition, newQuantity, newUploaderName],
    [oldISBN, oldTitle, oldGrade, oldSubject, oldCondition, oldQuantity, oldUploaderName]) => {

        if (newISBN && !oldISBN) progresses.value[0] += 25;
        if (!newISBN && oldISBN) progresses.value[0] -= 25;

        if (newTitle && !oldTitle) progresses.value[0] += 25;
        if (!newTitle && oldTitle) progresses.value[0] -= 25;

        if (newGrade && !oldGrade) progresses.value[0] += 25;
        if (!newGrade && oldGrade) progresses.value[0] -= 25;

        if(newSubject && !oldSubject) progresses.value[0] += 25;
        if(!newSubject && oldSubject) progresses.value[0] -= 25;

        if (newCondition && !oldCondition) progresses.value[1] += 50;
        if (!newCondition && oldCondition) progresses.value[1] -= 50;

        if (newQuantity && !oldQuantity) progresses.value[1] += 50;
        if (!newQuantity && oldQuantity) progresses.value[1] -= 50;

        if (newUploaderName && !oldUploaderName) progresses.value[2] += 100;
        if (!newUploaderName && oldUploaderName) progresses.value[2] -= 100;
    })
})
function getText(dataComp: { props: any }) {
  return (dataComp.props as { text: ComputedRef<string> }).text.value;
}
function addItem<T extends object>(
  newItem: T,                        
  optionsRef: Ref<T[]>,              
  selectedRef: Ref<T[] | T | null | undefined>,  
  multiple: boolean                  
) {
  const exists = optionsRef.value.some((opt: T) =>
    JSON.stringify(opt) === JSON.stringify(newItem)
  )
  if (!exists) {
    optionsRef.value.push(newItem)
  }

  if (multiple) {
    if (Array.isArray(selectedRef.value)) {
      selectedRef.value.push(newItem)
    } else {
      selectedRef.value = [newItem]
    }
  } else {
    selectedRef.value = newItem
  }
}

function deepUnref(obj: any): any {
  if (isRef(obj)) {
    return obj.value
  }
  if (Array.isArray(obj)) {
    return obj.map(deepUnref)
  }
  if (obj !== null && typeof obj === 'object') {
    const unreffed: any = {}
    for (const key in obj) {
      unreffed[key] = deepUnref(obj[key])
    }
    return unreffed
  }
  return obj
}

const toggleConfirmationModal = ref(false);

const selectedNotif: Ref<[DocumentReference, BuyerRequestedDoc] | null> = ref(null);

function openModal(item: [DocumentReference, BuyerRequestedDoc]) {
  selectedNotif.value = item;
  toggleConfirmationModal.value = true;
  window.scrollY = 0;
  document.body.style.overflow = "hidden";
}

const possibleStates = [
  ['Accepted', success],
  ['Denied', failure]
]

const activeState = ref<string[] | null>(null);

async function acceptRequest() {
  if (!selectedNotif.value) return;

  const [docRef, data] = selectedNotif.value;

  try {
    const matchedRef = doc(db, "matched", docRef.id);
    await setDoc(matchedRef, data);

    await deleteDoc(docRef);

    console.log(`Moved ${docRef.id} from buyerRequested → matched`);
  } catch (err) {
    console.error("Error accepting request:", err);
  }
}

async function denyRequest() {
  if (!selectedNotif.value) return;

  const [docRef] = selectedNotif.value;

  try {
    await deleteDoc(docRef);

    console.log(`Deleted ${docRef.id} from buyerRequested`);
  } catch (err) {
    console.error("Error denying request:", err);
  }
}

function closeConfirmationModal() {
  toggleConfirmationModal.value = false;
  document.body.style.overflow = "auto";
  document.body.style.overflowX = "hidden";
}
</script>
<template>
<Sidebar class="sidebar"></Sidebar>
<Navbar class="navbar"></Navbar>
<div class="grid">
  <div class="metabar-container">
    <MetaBar :title="'Donation'" @notif-click="openModal" ref="metaBar"></MetaBar>
  </div>
</div>
<div class="upload-container">
  <Transition name="fade" mode="out-in">
    <div class="progress-container" v-if="activeSlide < 5" >
        <div class="slide-number-container">
            <p class="slide-number" :key="activeSlide">
              <img :src="slideIcons[activeSlide - 1]" />
            </p>
        </div>
        <div class="bar-container">
          <div class="progress-fill" :style="{ width: progresses[activeSlide - 1] + '%' }"></div>
        </div>
    </div>
  </Transition>
    <div class="main-container">
      <Transition name="slide-fade" mode="out-in">
        <div class="slide-container" v-if="slides[activeSlide - 1]" :key="activeSlide">
          <div class="text-container">
            <h1 class="text-container-header">{{ slides[activeSlide - 1].header }}</h1>
            <div class="confirmation-columns-container" v-if="activeSlide == 5">
              <div class="confirmation-column">
                <div class="form-section" v-for="(section, i) in slides[activeSlide - 1].sections.slice(0, 3)" :key="i">
                    <p class="section-label">{{ section.label }}</p>
                    <component v-for="(dataComp, j) in section.data" :key="j" :is="dataComp.component" v-bind="dataComp.props">{{ getText(dataComp) }}</component>
                </div>
              </div>
              <div class="confirmation-column">
                <div class="form-section" v-for="(section, i) in slides[activeSlide - 1].sections.slice(3, 6)" :key="i">
                    <p class="section-label">{{ section.label }}</p>
                    <component v-for="(dataComp, j) in section.data" :key="j" :is="dataComp.component" v-bind="dataComp.props">{{ getText(dataComp) }}</component>
                </div>
              </div>
            </div>
            <div class="data-wrapper-normal" v-if="activeSlide < 5">
              <div class="form-section" v-for="(section, i) in slides[activeSlide - 1].sections" :key="i">
                <p class="section-label">{{ section.label }}</p>
                <div class="section-content">
                  <component
                    v-for="(dataComp, j) in section.data"
                    :key="j"
                    :is="dataComp.component"
                    v-bind="deepUnref(dataComp.props)"
                  />
                </div>
              </div>
            </div>
            <div class="data-wrapper-finished" v-if="activeSlide > 5">
              <div class="finished-flex">
                <div class="finished-col">
                  <div class="icon-container">
                    <img :src="bigCheckSVG"></img>
                  </div>
                  <h3>Donate online</h3>
                  <p>Donate the book online (already done!).</p>
                </div>
                <div class="finished-col">
                  <div class="icon-container">
                    <img :src="openBoxSVG"></img>
                  </div>
                  <h3>Drop it off</h3>
                  <p>Drop the book in the relevant box in the library.</p>
                </div>
                <div class="finished-col">
                  <div class="icon-container">
                    <img :src="communityOutreachSVG"></img>
                  </div>
                  <h3>Change a life</h3>
                  <p>Our outreach team delivers the books to kids who need them.</p>
                </div>
              </div>
              <button class="dashboard-btn" @click="router.push('/dashboard')">Back to Dashboard</button>
            </div>
            <div class="form-section button-section" v-if="activeSlide < 5">
              <button class="next-btn" @click = "nextSlide()">Next Section <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-right-icon lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></button>
            </div>
            <div class="form-section button-section" v-if="activeSlide == 5">
              <button class="next-btn" @click = "submitData()">Submit</button>
            </div>
          </div>
          <div class="graphic-container" v-if="activeSlide <= 5">

          </div>
        </div>
      </Transition>
    </div>
  </div>
  <div class="slide-number-change" v-if="activeSlide <= 5">
    <div class="slide-number-list">
      <div class="nav-left" @click="activeSlide > 1 && activeSlide--" :class="{disabled: activeSlide <= 1}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg></div>
      <div class="slide-number-selection" v-for="i in 5" :key="i" @click="activeSlide = i" :class="{active: activeSlide==i}">{{ i }}</div>
      <div class="nav-right" @click="activeSlide < 5 && activeSlide++" :class="{disabled: activeSlide >= 5}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg></div>
    </div>
  </div>

  <div class="modal-confirmation-container" v-if="toggleConfirmationModal">
      <div class="modal-confirmation-content">
        <div class="close-btn" @click="closeConfirmationModal()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
        <div class="text-half">
          <h1 class="confirm-header">Your book has been requested!</h1>
          <div class="book-metadata">
            <p><b>Book Requested:</b> {{ selectedNotif?.[1]?.title?.name }}</p>
            <p><b>Books Grade:</b> {{ selectedNotif?.[1]?.grade?.name }}</p>
          </div>
          <div class="requester-data">
            <p><b>Requester Name:</b> {{ selectedNotif?.[1]?.buyerName }}</p>
            <p><b>Requester Contact Preference:</b> {{ selectedNotif?.[1].buyerContactPreference.map((x: { name: string; code: string; }) => x.name).join(', ') }}</p>
            <p><b>Requester Delivery Preference:</b> {{ selectedNotif?.[1].buyerDeliveryPreference.map((x: { name: string; code: string; }) => x.name).join(', ') }}</p>
            <p><b>Quantity Requested:</b> {{ selectedNotif?.[1].buyerQuantity }}</p>
          </div>
          <div class="button-container">
            <button class="accept-btn" @click="activeState = possibleStates[0]; acceptRequest()" :disabled="activeState?.[0] != null">Accept</button>
            <button class="deny-btn" @click="activeState = possibleStates[1]; denyRequest()" :disabled="activeState?.[0] != null">Deny</button>
          </div>
        </div>
        <div class="image-half">
          <transition name="fade-in">
            <div class="state-container" v-if="activeState !== null">
              <div class="icon-container" :style="{ color: activeState?.[0] == 'Accepted' ? '#26e5bc' : '#ff9b9b' }" v-html="activeState?.[1]" v-if="activeState !== null"></div>
            </div>
          </transition>
        </div>
      </div>
  </div>
</template>
<style lang="scss" scoped>
.grid {
  @extend %filler;
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 1fr);
  padding-left: 5vw;
  .metabar-container {
    grid-row: 1/3;
    grid-column: 4 / 18;
  }
  background-color: $color-background;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.75s ease;
  opacity: 1;
  transform: translateX(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.upload-container {
    width: 60%;
    height: 60%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    background-color: $color-background-tertiary;
    margin-left: 2.5vw;
    .progress-container {
        position: absolute;
        top: 0;
        left: 0;
        height: 6vh;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0.5vw;
        z-index: 999;
        .slide-number-container {
            height: 100%;
            aspect-ratio: 1/1;
            border-radius: 50%;
            border: 3px solid $color-background-secondary;
            background-color: $color-primary;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Matangi';
            z-index: 2;
            margin-right: -10px;
            color: white;
            box-shadow: 0 0 10px 2px transparentize($color-primary, 0.25);
            .slide-number {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    @extend %centered;
                }
            }
        }
        .bar-container {
            position: relative;
            width: 100%;
            height: 10px;
            border: none;
            appearance: none;
            background-color: $color-background;
            border-radius: 10px;
            overflow: hidden;
            .progress-fill {
                position: absolute;
                top: 0;
                left: 0;
                width: 0;
                height: 100%;
                background-color: $color-primary;
                border-radius: 10px;
                transition: width 0.3s ease;
            }
        }
    }
    .main-container {
        height: 100%;
        width: 100%;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        .slide-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          .text-container {
            @extend %filler;
            flex: 1;
            max-height: 100%;
            padding: 1vw;
            padding-top: 6vh;
            display: flex;
            flex-direction: column;
            .data-wrapper-normal {
              width: 100%;
              height: 85%;
              max-height: 85%;
              overflow: scroll;
              display: flex;
              flex-direction: column;
            }
            .data-wrapper-finished {
              width: 100%;
              height: 85%;
              max-height: 85%;
              overflow: scroll;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              padding: 0.5rem;
              .finished-flex {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                .finished-col {
                  display: flex;
                  align-items: center;
                  text-align: center;
                  flex-direction: column;
                  height: 60%;
                  max-height: 60%;
                  width: 25%;
                  h3 {
                    font-family: 'Manrope';
                    color: $color-accent;
                  }
                  p {
                    font-family: 'Nunito';
                    color: $color-text;
                  }
                  .icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 50%;
                    img {
                      height: 65%;
                      aspect-ratio: 1/1;
                    }
                  }
                }
              }
            }
            .text-container-header {
                font-family: 'Manrope';
                color: $color-accent;
            }
            .form-section {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                row-gap: px-to-vw(5);
                font-family: 'Nunito';
                font-size: px-to-vw(14);
                .section-label {
                  align-self: flex-start;
                    font-family: 'Nunito';
                    font-weight: bold;
                }
                .section-content {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  column-gap: px-to-vw(10);
                  textarea {
                    border: 1px solid rgba(211, 211, 211, 0.5);
                    border-radius: 10px;
                    outline: none;
                    font-family: 'Nunito';
                    resize: none;
                    width: 100%;
                    height: 100%;
                  }
                }
            }
            .button-section {
                width: 100%;
                height: 15%;
                align-items: center;
                justify-content: center;
                @extend %centered;
                button {
                    width: fit-content !important;
                    border-radius: 10px;
                    color: $color-text;
                    border-radius: 14px;
                    background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
                    cursor: pointer;
                    border: 2px solid $color-background;
                    transition: box-shadow 0.4s ease;
                    column-gap: 5px;
                    &:hover {
                        box-shadow: 0 0 0 2px $color-primary;
                    }
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    svg {
                        margin-bottom: -1px;
                        aspect-ratio: 1/1;                    
                    }
                }
            }
          }
          .graphic-container {
              @extend %filler;
              background-color: $color-accent-lightened;
              border-top-right-radius: 10px;
              border-bottom-right-radius: 10px;
          }
        }
    }
}

.dashboard-btn {
  padding: 1rem;
  width: fit-content !important;
  border-radius: 10px;
  color: $color-text;
  border-radius: 14px;
  background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
  border: 2px solid $color-background;
  transition: box-shadow 0.4s ease;
  column-gap: 5px;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 0 2px $color-primary;
  }
}

.confirmation-columns-container {
  display: flex;
  width: 100%;
  height: 100%;
  .confirmation-column {
    width: 50%;
    height: 100%;
    min-width: 0;
    flex: 0 0 auto;
    .form-section {
      height: calc(100%/3) !important;
      .confirmation-field {
        width: 100%;
        max-width: 100%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
      }
    }
  }
}
.slide-number-change {
  position: absolute;
  top: 90%;
  left: 50%;
  width: 180px;
  aspect-ratio: 5/1;
  transform: translate(-50%, -50%);
  padding: 0.5vw;
  background-color: $color-background-secondary;
  border: 1px solid $color-background-tertiary;
  border-radius: 20px;
  column-gap: 10px;
  .slide-number-list {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
    .nav-left, .nav-right {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }
    .disabled {
      opacity: 0.3;
      pointer-events: none;
      cursor: not-allowed;
    }
    .slide-number-selection {
      overflow: hidden;
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-family: 'Nunito';
      border-radius: 50%;
      &:last-child {
        border: none;
      }
      &:hover {
        background-color: transparentize($color-primary, 0.5);
      }
      cursor: pointer;
      transition: background 750ms ease;
    }
    .active {
      background-color: $color-primary;
    }
  }
}
.form-input {
  width: 100%;
  padding: 0.5vw 1vw;
  border-radius: 20px;
  border: 1px solid lightgray;
}
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  width: px-to-vw(18);
  height: px-to-vw(18);
  border: 2px solid #999;
  border-radius:  px-to-vw(4);
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}

input[type="checkbox"]:checked {
  background-color: $color-primary;
  border-color: transparent;
}


input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  top: 40%;
  left: 50%;
  width: 40%;
  height: 80%;
  border: solid white;
  border-width: 0 0.2vw 0.2vw 0;
  border-radius: 2px;
  transform: translate(-50%, -50%) rotate(45deg);
}
.close-btn {
  position: absolute;
  top: 1.25%;
  right: 2%;
  cursor: pointer;
  z-index: 999;
  width: 40px;
  aspect-ratio: 1/1;
  @extend %centered;
  svg {
    width: 50%;
    aspect-ratio: 1/1;
  }
}
.modal-confirmation-container {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  width: 100%;
  height: 100vh;
  @extend %centered;
  z-index: 9999;
  .modal-confirmation-content {
    position: relative;
    width: 65%;
    height: 70%;
    background-color: $color-background;
    border-radius: 20px;
    display: flex;
  }
  .text-half {
    flex: 1;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 1.5vw;
    display: flex;
    flex-direction: column;
    h1 {
      font-family: 'Manrope';
    }
    .book-metadata {
      p {
        font-family: 'Nunito';
      }
      margin-top: 2%;
      margin-bottom: 5%;
    }
    .requester-data {
      p {
        font-family: 'Nunito';
      }
    }
    .button-container {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 10%;
      .accept-btn {
        font-family: 'Nunito';
        border-radius: 14px;
        background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
        cursor: pointer;
        border: 4px solid $color-background;
        transition: box-shadow 0.4s ease;
        &:hover {
            box-shadow: 0 0 0 4px $color-primary;
        }
      }    
      .deny-btn {
        font-family: 'Nunito';
        border-radius: 14px;
        background: #ff9b9b;
        cursor: pointer;
        border: 4px solid $color-background;
        transition: box-shadow 0.4s ease;
        &:hover {
            box-shadow: 0 0 0 4px #ff9b9b;
        }
      }    
    }
  }
  .image-half {
    background-color: $color-accent;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    align-items: center;
    justify-content: center;
    .state-container {
      @extend %centered;
      flex-direction: column;
      height: 50%;
      aspect-ratio: 1/1;
      .icon-container {
        @extend %centered;
        height: 100%;
        aspect-ratio: 1/1;
        svg {
          width: 75%;
          aspect-ratio: 1/1;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }
        svg path:nth-child(1) {
          stroke-dasharray: 4.1886;
          stroke-dashoffset: 4.1886;
          animation: draw-svg 0.5s ease forwards;
        }
          
        svg path:nth-child(2) {
          stroke-dasharray: 40.9641;
          stroke-dashoffset: 40.9641;
          animation: draw-svg 1s ease forwards 0.5s;
        }
      }
    }
  }
}
::-webkit-scrollbar {
  width: 0;
  height: 0.5vw;
}
::-webkit-scrollbar-thumb {
  background-color: $color-primary;
  border-radius: 20px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}

@media screen and (min-width: 1025px) {
  .button-container {
    button {
      font-size: px-to-vw(15);
      padding: 0.5vw 1.5vw;
    }
  }
  .confirm-header {
    font-size: px-to-vw(40);
  }
  .requester-data {
    p {
      font-size: px-to-vw(15);
    }
  }
  .book-metadata {
    p {
      font-size: px-to-vw(17);
    }
  }
  .sidebar {
    display: flex;
  }
  .navbar {
    display: none;
  }
  .graphic-container {
    flex: 1;
  }
  .section-label {
    font-size: px-to-vw(15);
  }
  .text-container-header {
    font-size: px-to-vw(40);
  }
  .button-section {
    button {
      padding: 0.5vw 1vw;
      font-size: px-to-vw(15);
      svg {
        width: 1vw;
      }
    }
  }
  .slide-number {
    img {
      width: 75%;
    }
  }
  .form-input {
    font-size: px-to-vw(15);
  }
  .confirmation-field {
    font-size: px-to-vw(13);
  }
}
@media screen and (max-width: 1025px) {
  .button-container {
    button {
      font-size: px-to-vw(50);
      padding: 1vw 2vw;
    }
  }
  .confirm-header {
    font-size: px-to-vw(60);
  }
  .requester-data {
    p {
      font-size: px-to-vw(40);
    }
  }
  .book-metadata {
    p {
      font-size: px-to-vw(35);
    }
  }
  .sidebar {
    display: none;
  }
  .navbar {
    display: flex;
  }
  .graphic-container {
    flex: 0;
  }
  .section-label {
    font-size: px-to-vw(40);
  }
  .text-container-header {
    font-size: px-to-vw(60);
  }
  .button-section {
    button {
      padding: 1.25vw 1.75vw;
      font-size: px-to-vw(40);
      svg {
        width: 2.25vw;
      }
    }
  }
  .slide-number {
    img {
      width: 60%;
    }
  }
  .form-input {
    font-size: px-to-vw(20);
  }
  .confirmation-field {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 950px) {
  .button-container {
    button {
      font-size: px-to-vw(50);
      padding: 1vw 2vw;
    }
  }
  .confirm-header {
    font-size: px-to-vw(67.5);
  }
  .requester-data {
    p {
      font-size: px-to-vw(45);
    }
  }
  .book-metadata {
    p {
      font-size: px-to-vw(40);
    }
  }
  .sidebar {
    display: none;
  }
  .navbar {
    display: flex;
  }
  .graphic-container {
    flex: 0;
  }
  .section-label {
    font-size: px-to-vw(35);
  }
  .text-container-header {
    font-size: px-to-vw(60);
  }
  .button-section {
    button {
      padding: 1.5vw 2vw;
      font-size: px-to-vw(40);
      svg {
        width: 2.25vw;
      }
    }
  }
  .slide-number {
    img {
      width: 55%;
    }
  }
  .form-input {
    font-size: px-to-vw(30);
  }
  .confirmation-field {
    font-size: px-to-vw(27);
  }
}
@media screen and (max-width: 550px) {
  .button-container {
    button {
      padding: 2vw 4vw;
      font-size: px-to-vw(60);
    }
  }
  .confirm-header {
    font-size: px-to-vw(80);
  }
  .requester-data {
    p {
      font-size: px-to-vw(50);
    }
  }
  .book-metadata {
    p {
      font-size: px-to-vw(50);
    }
  }
  .sidebar {
    display: none;
  }
  .navbar {
    display: flex;
  }
  .graphic-container {
    flex: 0;
  }
  .section-label {
    font-size: px-to-vw(50);
  }
  .text-container-header {
    font-size: px-to-vw(80);
  }
  .button-section {
    button {
      padding: 2vw 3vw;
      font-size: px-to-vw(60);
      svg {
        width: 3vw;
      }
    }
  }
  .slide-number {
    img {
      width: 50%;
    }
  }
  .form-input {
    font-size: px-to-vw(50);
  }
  .confirmation-field {
    font-size: px-to-vw(40);
  }
}
</style>