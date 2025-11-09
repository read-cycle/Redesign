<script lang="ts" setup>
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import BrowserCard from './BrowserCard.vue';
import Multiselect from 'vue-multiselect'
import { computed, isRef, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import Datepicker from 'vue3-datepicker'
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase-init';
import { type BuyerRequestedDoc, type CodeName, type UploadDoc } from '../interfaces';
import bookSVG from '../assets/icons/book.svg'
import infoSVG from '../assets/icons/info.svg'
import checkSVG from '../assets/icons/check.svg'
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import { sendEmail } from '../sendEmail';
import Navbar from '../components/Navbar.vue';
import { isbnToSubject } from "BookMappings";

let userID: string | null = null;
let displayName: string | null = null;

async function autofillUserData() {
  if(!userID || !displayName) return

  const snap = await getDoc(doc(db, "users", userID));

  buyerName.value = displayName;

  if(snap.exists()) {
    const data = snap.data()
    buyerContactPreference.value = data.contactPreferences;
    buyerDeliveryPreference.value = data.deliveryPreferences;
  }
}

onAuthStateChanged(auth, async(user) => {
  if (user) {
    userID = user.uid;
    displayName = user.displayName;
    await autofillUserData()
  } else {
    router.push('/login')
  }
})

const fromDate = ref<Date | undefined>(undefined)
const toDate = ref<Date | undefined>(undefined)

const filterButtonRef = ref<HTMLElement | null>(null);
const sortButtonRef = ref<HTMLElement | null>(null);

const subjectOptions: Ref<CodeName[]> = ref(Array.from(new Set(Object.values(isbnToSubject))).map((val) => ({
    name: val as string,
    code: (val as string).toLowerCase().replace(/\s+/g, '-')})))

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
  if(selectedField.value == 'Grade') {
    filteredDocs.value.sort((a, b) => {
      const gradeA = a[1].grade ? parseInt(a[1].grade.code.slice(1)) : 0;
      const gradeB = b[1].grade ? parseInt(b[1].grade.code.slice(1)) : 0;
      if(selectedSort.value === 'Ascending') {
        return gradeA - gradeB;
      } else {
        return gradeB - gradeA;
      }
    });
  } else if (selectedField.value == 'Date') {
    filteredDocs.value.sort((a, b) => {
      const timeA = a[1].timestamp ? a[1].timestamp.toMillis() : 0;
      const timeB = b[1].timestamp ? b[1].timestamp.toMillis() : 0;

      if (selectedSort.value === 'Ascending') {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });
  }
}

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

const selectedGrades: Ref<CodeName[]> = ref([]);

const selectedISBNs: Ref<CodeName[]> = ref([]);

const selectedSubjects: Ref<CodeName[]> = ref([]);

let tagOptions: Ref<{ name: string; code: string }[]> = ref([
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
const selectedTags: Ref<CodeName[]> = ref([]);

const searchQuery = ref('');

const showFilters = ref(false);

const showSorts = ref(false);

const today = new Date();

const uploadDocs = query(
  collection(db, 'uploadPool'),
  orderBy('timestamp', 'desc')
);

const docsData: Ref<[DocumentReference, UploadDoc][]> = ref([]);

const cards = ref<HTMLElement[]>([]);

const filteredDocs: Ref<[DocumentReference, UploadDoc][]> = ref([]);

getDocs(uploadDocs).then((result) => {
  docsData.value = result.docs.map((doc) => {
    const data = doc.data() as UploadDoc;
    return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
  });
  filteredDocs.value = [...docsData.value]

  nextTick(() => {
    cards.value = Array.from(document.querySelectorAll('.browsercard-container'));
    console.log(cards.value);
  });
});

const toggleModal = ref(false);
const currentDocRef: Ref<DocumentReference | undefined> = ref(filteredDocs?.value?.[1]?.[0]);
const currentCardData: Ref<UploadDoc | undefined> = ref(filteredDocs?.value?.[1]?.[1])
const currentImageIndex = ref(0)

const images = computed(() => [
  currentCardData.value?.listingImage,
  ...(currentCardData.value?.extraImages || [])
].filter(Boolean))

const isLeftDisabled = computed(() => currentImageIndex.value <= 0)
const isRightDisabled = computed(() => currentImageIndex.value >= images.value.length - 1)
const direction = ref('forwards')

watch(toggleModal, (newState, oldState) => {
  console.log("TOGGLE MODAL STATE:", newState)
  if(newState && !oldState) {
    currentImageIndex.value = 0;
    activeSlide.value = 1;
  }
})

function prevImage() {
  direction.value = 'backwards';
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function nextImage() {
  direction.value = 'forwards';
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}
function useTeleportDropdown(el: HTMLElement) {
  let dropdown: HTMLElement | null = null
  const observer = new MutationObserver(() => {
    const found = el.querySelector(".multiselect__content-wrapper") as HTMLElement
    if (found && found !== dropdown) {
      dropdown = found
      document.body.appendChild(dropdown)
      positionDropdown()
    }
  })

  const positionDropdown = () => {
    if (!dropdown) return
    const rect = el.getBoundingClientRect()
    dropdown.style.position = "absolute"
    dropdown.style.top = rect.bottom + "px"
    dropdown.style.left = rect.left + "px"
    dropdown.style.width = rect.width + "px"
    dropdown.style.zIndex = "9999"
  }

  const cleanup = () => {
    observer.disconnect()
    if (dropdown) dropdown.remove()
  }

  observer.observe(el, { childList: true, subtree: true })
  window.addEventListener("resize", positionDropdown)
  window.addEventListener("scroll", positionDropdown, true)

  return cleanup
}
onMounted(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.classList.contains("multiselect")) {
          console.log("NEW MULTISELECT: ", node)
          const cleanup = useTeleportDropdown(node)
          onBeforeUnmount(cleanup)
        }
        // also check children of added node
        if (node instanceof HTMLElement) {
          node.querySelectorAll(".multiselect").forEach(el => {
            console.log("NEW MULTISELECT (child): ", el)
            const cleanup = useTeleportDropdown(el as HTMLElement)
            onBeforeUnmount(cleanup)
          })
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  document.querySelectorAll(".multiselect").forEach(el => {
    const cleanup = useTeleportDropdown(el as HTMLElement)
    onBeforeUnmount(cleanup)
  })

  onBeforeUnmount(() => observer.disconnect())
})
const activeSlide = ref(1);

const slideIcons = [bookSVG, infoSVG, checkSVG]

const progressThresholds: number[] = [100, 100]
const progresses: Ref<number[]> = ref([100, 0])

const contactPreferenceOptions =  [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }]
const buyerContactPreference: Ref<{name: string, code: string}[]> = ref([])

const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }]
const buyerDeliveryPreference: Ref<{name: string, code: string}[]> = ref([])

const buyerName = ref('');

const buyerQuantity = ref(1);

watch(
  [buyerName, buyerDeliveryPreference, buyerContactPreference, buyerQuantity],
  (
    [newName, newDelivery, newContact, newQuantity],
    [oldName, oldDelivery, oldContact, oldQuantity]
  ) => {    
    if (newName && !oldName) progresses.value[1] += 20;
    if (!newName && oldName) progresses.value[1] -= 20;
    
    if (newQuantity && !oldQuantity) progresses.value[1] += 100/3;
    if (!newQuantity && oldQuantity) progresses.value[1] -= 100/3;
    
    const newContactPreferenceLen = Array.isArray(newContact) ? newContact.length : 0;
    const oldContactPreferenceLen = Array.isArray(oldContact) ? oldContact.length : 0;
    
    if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0) progresses.value[1] += 100/3;
    if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0) progresses.value[1] -= 100/3;
    
    const newDeliveryLen = newDelivery.length;
    const oldDeliveryLen = oldDelivery.length;
    
    if (newDeliveryLen > 0 && oldDeliveryLen === 0) progresses.value[1] += 100/3;
    if (newDeliveryLen === 0 && oldDeliveryLen > 0) progresses.value[1] -= 100/3;
    
    console.log("PROGRESSES: ", progresses.value);
})

async function nextSlide() {
  if(progresses.value[activeSlide.value - 1] >= progressThresholds[activeSlide.value - 1]) {
    console.log("ACTIVESLIDE: ", activeSlide.value);
    setTimeout(() => {
      activeSlide.value++;
    }, 375);
    if(activeSlide.value == slides.length) {
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
        
          const docData = docSnap.data() as UploadDoc;
        
          sendEmail(docData.uploaderEmail, 'Your book has been requested!', 'Yay!!')

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
        } catch (err) {
          console.error("Error moving document:", err);
        }
    }
  } else {
    window.alert("Please fill in all required fields.");
    console.log("ERROR PROGRESSES: ", progresses.value)
  }
}

function getText(dataComp: { props: any }) {
  return (dataComp.props as { text: ComputedRef<string> }).text.value;
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
              text: computed(() =>
                `Tags: ${currentCardData.value?.tags?.length
                  ? currentCardData.value.tags.map(tag => tag.name).join(', ')
                  : 'None'}`
              ),
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
              text: computed(() =>
                `Condition Details: ${currentCardData.value?.conditionDetails?.length
                  ? currentCardData.value.conditionDetails.map(tag => tag.name).join(', ')
                  : 'None'}`
              ),
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
              text: computed(() =>
                `Price: ${currentCardData.value?.price != null ? `₹${currentCardData.value.price}` : 'Not specified'}`
              ),
              class: 'confirmation-field'
            }
          },
          {
            component: 'p',
            props: {
              text: computed(() =>
                `Quantity: ${currentCardData.value?.quantity != null
                  ? currentCardData.value.quantity
                  : 'Not specified'}`
              ),
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
              text: computed(() =>
                `Delivery Preference: ${currentCardData.value?.deliveryPreference?.length
                  ? currentCardData.value.deliveryPreference.map(tag => tag.name).join(', ')
                  : 'None'}`
              ),
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
              text: computed(() =>
                `Contact Preference: ${currentCardData.value?.contactPreference?.length
                  ? currentCardData.value.contactPreference.map(tag => tag.name).join(', ')
                  : 'None'}`
              ),
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
              onInput: (e: Event) => buyerName.value = (e.target as HTMLInputElement).value,
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
              onInput: (e: Event) => buyerQuantity.value = +(e.target as HTMLInputElement).value,
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => buyerDeliveryPreference.value = val,
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => buyerContactPreference.value = val,
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

function applyFilters() {
  filteredDocs.value = docsData.value.filter(([_, doc]) => {

    console.log("CHECKING")

    if (selectedTags.value.length >= 1) {
      if (!doc.tags || !selectedTags.value.every(sel => doc.tags.some(tag => tag.code === sel.code))) {
        return false;
      }
    }

    console.log("PASSED TAGS", selectedTags.value)

    if (selectedGrades.value.length >= 1) {
      if (!doc.grade || !selectedGrades.value.some(g => g.code === doc.grade?.code)) {
        console.log('Selected grades:', selectedGrades.value.map(g => g.code));
        console.log('Doc grade:', doc.grade?.code);
        return false;
      }
    }

    console.log("PASSED GRADES", selectedGrades.value)

    if (selectedISBNs.value.length >= 1) {
      if (!doc.isbn || !selectedISBNs.value.some(i => i.code === doc.isbn?.code)) {
        return false;
      }
    }

    console.log("PASSED ISBNS", selectedISBNs.value)

    if (selectedSubjects.value.length >= 1) {
      if (!doc.subject || !selectedSubjects.value.some(s => s.code === doc.subject?.code)) {
        return false;
      }
    }

    console.log("PASSED SUBJECTS", selectedSubjects.value)

    const docTime = doc.timestamp.toMillis();
    if (fromDate.value && docTime < fromDate.value.getTime()) return false;
    if (toDate.value && docTime > toDate.value.getTime()) return false;

    console.log("PASSED TIMES")

    return true;
  });
};

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
function addItem<T extends object>(
  newItem: T,
  options: Ref<T[]> | T[],
  selected: Ref<T[] | T | null | undefined> | T[] | T,
  multiple: boolean
) {
  const getArray = (val: Ref<T[]> | T[]) => ('value' in val ? val.value : val)

  const optionsArr = getArray(options)
  const exists = optionsArr.some(opt => JSON.stringify(opt) === JSON.stringify(newItem))
  if (!exists) optionsArr.push(newItem)

  if ('value' in selected) {
    if (multiple) {
      if (!Array.isArray(selected.value)) selected.value = selected.value != null ? [selected.value] : []
      selected.value.push(newItem)
    } else {
      selected.value = newItem
    }
  } else {
    if (multiple) {
      if (!Array.isArray(selected)) throw new Error("Expected selected to be an array for multiple=true")
      selected.push(newItem)
    } else {
      selected = newItem as any
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

  applyFilters()

  filteredDocs.value = filteredDocs.value.filter(doc => {
    const title = doc[1].title?.name.toLowerCase() || "";
    const gradeName = doc[1].grade?.name?.toLowerCase() || "";
    const tags = doc[1].tags?.map(t => t.name.toLowerCase()) || [];

    console.log(doc, (
      title.includes(query) ||
      gradeName.includes(query) ||
      tags.some(tag => tag.includes(query))
    ))

    return (
      title.includes(query) ||
      gradeName.includes(query) ||
      tags.some(tag => tag.includes(query))
    );
  });
});

</script>
<template>
    <Sidebar class="sidebar"></Sidebar>
    <Navbar class="navbar"></Navbar>
    <div class = "main-grid">
        <div class = "metabar-container">
          <MetaBar :title="'Browser'" @notif-click="openModal" ref="metaBar"></MetaBar>
        </div>
        <div class="filters-bar">
          <div class="input-box">
            <p>Searchbar</p>
            <input
              class="search-input"
              type="text"
              placeholder="Search..."
              v-model="searchQuery"
            />
          </div>

          <div class="filters-box">
            <p>Filters</p>
            <div class="option-btn-container">
              <button class="option-btn sort-button" title="Sorting Options" @click="showSorts = !showSorts" ref="sortButtonRef">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-wide-narrow-icon lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
                Sort
              </button>
              <button class="option-btn filter-button" title="More Filters" @click="showFilters = !showFilters" ref="filterButtonRef">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>
                Filter
              </button>
              <div v-if="showFilters" class="filter-dropdown">
                <div class="filter-block title-block">
                  <label>Filters</label>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Subject</label>
                    <label class="reset-btn" @click="selectedSubjects = []; applyFilters()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedSubjects" 
                      :options="subjectOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Subjects" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>ISBN</label>
                    <label class="reset-btn" @click="selectedISBNs = []; applyFilters()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedGrades" 
                      :options="gradeOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Grades" 
                      class="multiselect tag-multiselect"
                      label="name"
                      trackBy="code"
                      @tag="(newTag: string) => {
                        const tagObj = {
                          name: newTag,
                          code: newTag.replace(/[\s-]/g, '')
                        }
                        addItem(tagObj, gradeOptions, selectedGrades, true)
                      }"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Grade</label>
                    <label class="reset-btn" @click="selectedGrades = []; applyFilters()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedGrades" 
                      :options="gradeOptions" 
                      :multiple="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Grades" 
                      class="multiselect tag-multiselect"
                      label="name"
                      trackBy="code"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Date</label>
                    <label class="reset-btn" @click="fromDate = undefined; toDate = undefined; applyFilters()">Reset</label>
                  </div>
                  <div class="selection-track date-selection-track">
                    <Datepicker v-model="fromDate" placeholder="From date" :maxDate="today"/>
                    <Datepicker v-model="toDate" placeholder="To date" :maxDate="today"/>
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Tags</label>
                    <label class="reset-btn" @click="selectedTags = []; applyFilters()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedTags" 
                      :options="tagOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Tags" 
                      class="multiselect tag-multiselect"
                      label="name"
                      trackBy="code"
                      @tag="(newTag: string) => {
                        const tagObj = {
                          name: newTag,
                          code: newTag.replace(/[\s-]/g, '')
                        }
                        addItem(tagObj, tagOptions, selectedTags, true)
                      }"
                    /> 
                  </div>
                </div>
                <div class="filter-block submit-block">
                  <div class="label-track submit-track">
                    <button class="delete-btn" @click="selectedTags = []; fromDate = undefined; toDate = undefined; selectedGrades = []; selectedSubjects = []; applyFilters()"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All</button>
                    <button class="apply-btn" @click="applyFilters()">Apply All</button>
                  </div>
                </div>
              </div>
              <div v-if="showSorts" class="filter-dropdown">
                <div class="filter-block title-block">
                  <label>Sort Options</label>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Sort By</label>
                    <label class="reset-btn" @click="selectedField = null; applySort()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedField" 
                      :options="fieldOptions" 
                      :searchable="true"
                      placeholder="Sort By" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Type</label>
                    <label class="reset-btn" @click="selectedSort = null; applySort()">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedSort" 
                      :options="sortOptions" 
                      :searchable="true"
                      placeholder="Asc/Desc" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block submit-block">
                  <div class="label-track submit-track">
                    <button class="delete-btn" @click="selectedField = null; selectedSort = null; applySort()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All</button>
                    <button class="apply-btn" @click="applySort()">Apply All</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class = "grid-container">
            <BrowserCard v-for="docData in filteredDocs" :data="docData[1]" @click="currentCardData = docData[1]; currentDocRef = docData[0]; openBrowserCardModal()"></BrowserCard>
        </div>
    </div>
    <div class="modal-book-expanded-container" v-if="toggleModal">
      <div class="modal-book-expanded-content">
        <div class="close-btn" @click="closeBrowserCardModal()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
        <div class="progress-container">
          <div class="slide-number-container">
              <p class="slide-number" :key="activeSlide">
                <img :src="slideIcons[activeSlide - 1]" width="24" height="24" />
              </p>
          </div>
          <div class="bar-container">
            <div class="progress-fill" :style="{ width: progresses[activeSlide - 1] + '%' }"></div>
          </div>
        </div>
        <transition name="fade-slide" mode="out-in">
          <div class="slide-container" :key="activeSlide">
            <div class="text-half">
              <div class="header-wrapper" v-if="activeSlide !== 3">
                <h1>{{ slides[activeSlide - 1].header }}</h1>
                <p>{{ slides[activeSlide - 1].desc1 }}</p>
                <p>{{ slides[activeSlide - 1].desc2 }}</p>
              </div>
              <div class="main-container">
                <div 
                  class="confirmation-columns-container" 
                  v-if="activeSlide === 1"
                >
                  <div class="confirmation-column">
                  <div 
                    class="form-section" 
                    v-for="(section, i) in slides[activeSlide - 1].sections.slice(0, 3)" 
                    :key="i"
                  >
                    <p class="section-label">{{ section.label }}</p>
                    <component 
                      v-for="(dataComp, j) in section.data" 
                      :key="j" 
                      :is="dataComp.component" 
                      v-bind="dataComp.props"
                    >
                      {{ getText(dataComp) }}
                    </component>
                  </div>
                  </div>
                
                  <div class="confirmation-column">
                  <div 
                    class="form-section" 
                    v-for="(section, i) in slides[activeSlide - 1].sections.slice(3, 7)" 
                    :key="i"
                  >
                    <p class="section-label">{{ section.label }}</p>
                    <component 
                      v-for="(dataComp, j) in section.data" 
                      :key="j" 
                      :is="dataComp.component" 
                      v-bind="dataComp.props"
                    >
                      {{ getText(dataComp) }}
                    </component>
                  </div>
                  </div>
                </div>
                <div class="other-container-misc" v-if="activeSlide === 2">
                  <div 
                    class="form-section" 
                    v-for="(section, i) in slides[activeSlide - 1].sections" 
                    :key="i"
                  >
                    <p class="section-label">{{ section.label }}</p>
                    <component 
                      v-for="(dataComp, j) in section.data" 
                      :key="j" 
                      :is="dataComp.component" 
                      v-bind="deepUnref(dataComp.props)"
                    >
                    </component>
                  </div>
                </div>
                <div class="confirmation-container" v-if="activeSlide === 3">
                  <div class="icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg></div>
                  <div class="confirmation-text">
                    <p>Your request has been sent!<br></br>We'll email you when we receive a response!</p>
                  </div>
                </div>
                <div class="btn-container" v-if="activeSlide !== 3"><button class="proceed-btn" @click="nextSlide()">Proceed</button></div>
              </div>
            </div>
            <div class="images-half" v-if="activeSlide === 1 || (activeSlide == 2 && windowWidth > 1025)">
              <div class="images-carousel" v-if="activeSlide === 1">
                <div class="images-wrapper">
                  <transition :name="`fade-slide-${direction}`" mode="out-in">
                    <div class="image-wrapper" :key="images[currentImageIndex]">
                        <img
                          :src="images[currentImageIndex]"
                        />
                    </div>
                  </transition>
                </div>   
              </div>
              <button class="chevron-left-images-carousel" v-if="activeSlide === 1"
                :disabled="isLeftDisabled"
                @click="prevImage">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button class="chevron-right-images-carousel" v-if="activeSlide === 1"
                :disabled="isRightDisabled"
                @click="nextImage">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <div class="modal-confirmation-container" v-if="toggleConfirmationModal">
      <div class="modal-confirmation-content">
        <div class="close-btn" @click="closeModal()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
        <div class="text-half">
          <h1 class="confirm-header">Your book has been requested!</h1>
          <div class="book-metadata">
            <p><b>Book Requested:</b> {{ selectedNotif?.[1]?.title?.name }}</p>
            <p><b>Books Grade:</b> {{ selectedNotif?.[1]?.grade?.name }}</p>
          </div>
          <div class="requester-data">
            <p><b>Requester Name:</b> {{ selectedNotif?.[1]?.buyerName }}</p>
            <p><b>Requester Contact Preference:</b> {{ selectedNotif?.[1].buyerContactPreference.map(x => x.name).join(', ') }}</p>
            <p><b>Requester Delivery Preference:</b> {{ selectedNotif?.[1].buyerDeliveryPreference.map(x => x.name).join(', ') }}</p>
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
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-forwards-enter-active,
.fade-slide-forwards-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}
.fade-slide-forwards-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-forwards-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-slide-backwards-enter-active,
.fade-slide-backwards-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}
.fade-slide-backwards-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-slide-backwards-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.main-grid {
  @extend %filler;
  color: $color-text;
  background-color: $color-background;
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 1fr);
  position: relative;
  padding-left: 5vw;
  min-height: 0;
  .metabar-container {
    grid-row: 1/3;
    grid-column: 4 / 18;
  }
  .grid-container {
    grid-row: 5/20;
    grid-column: 4/18;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
    grid-auto-rows: 282px;
    gap: 1rem;
    overflow-y: scroll;
    min-height: 0;
    place-items: center;
  }
}
.filters-bar {
  grid-row: 3/5;
  grid-column: 4/18;
  display: flex;
  align-items: center;
  .input-box { 
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    font-family: 'Nunito';
    font-size: px-to-vw(12);
  }
  .filters-box {
    position: relative;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    p {
      font-family: 'Nunito';
      font-size: px-to-vw(12);
    }
  }
}
.option-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 5px;
  .option-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 5px;
    border-radius: 10px;
    border: 1px solid lightgray;
    background-color: transparent;
    box-shadow: 1px 1px 10px rgba(211, 211, 211, 0.5);
    cursor: pointer;
    svg {
      color: $color-accent-lightened;
    }
  }
}
.search-input {
  border-radius: 10px;
  padding: 0.5vw;
  border: 1px lightgray solid;
  box-shadow: 1px 1px 10px rgba(211, 211, 211, 0.5);
}
.filter-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: clamp(6vw, 12vw, 50vw);
  background-color: $color-background;
  border-radius: 10px;
  border: 1px solid rgba(211, 211, 211, 0.5);
  .filter-block {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    border-bottom: 1px solid rgba(211, 211, 211, 0.5);
    .label-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Nunito';
      .reset-btn {
        text-decoration: underline;
        color: $color-accent;
      }
    }
    .submit-track {
      button {
        cursor: pointer;
      }
      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        column-gap: 5px;
      }
      .apply-btn {
        background-color: $color-primary;
        color: white;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
      }
    }
    .selection-track {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 5px;
    }
  }
  .submit-block {
    padding: 0.5vw !important;
  }
  .title-block {
    label {
      font-family: 'Manrope';
    }
  }
}
::v-deep .date-selection-track {
  .v3dp__datepicker {
    width: 50%;
    .v3dp__input_wrapper {
      input {
        width: 100%;
        padding: 5px;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        background: $color-background-secondary;
      }
    }
  }
}
.modal-book-expanded-container {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  width: 100%;
  height: 100vh;
  @extend %centered;
  z-index: 9999;
  .modal-book-expanded-content {
    position: relative;
    width: 75%;
    height: 80%;
    background-color: $color-background;
    border-radius: 20px;
    display: flex;
    .slide-container {
      @extend %filler;
      display: flex;
      .text-half {
        flex: 1;
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
        padding: 1.5vw;
        padding-top: 6vh;
        display: flex;
        flex-direction: column;
        row-gap: px-to-vw(30);
        .main-container {
          @extend %filler;
          display: flex;
          flex-direction: column;
          .other-container-misc {
            display: flex;
            flex-direction: column;
            row-gap: px-to-vw(15);
          }
          .confirmation-container {
            @extend %filler;
            @extend %centered;
            flex-direction: column;
            @keyframes draw-svg {
              to {
                stroke-dashoffset: 0;
              }
            }
            .icon-container {
              width: 15%;
              aspect-ratio: 1/1;
              color: $color-primary;
              @extend %centered;
              svg {
                width: 75%;
                aspect-ratio: 1/1;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw-svg 20s ease forwards;
              }
            }
            .confirmation-text {
              font-family: 'Nunito';
              font-size: px-to-vw(20);
              text-align: center;
            }
          }
        }
        .header-wrapper {
          display: flex;
          flex-direction: column;
          row-gap: px-to-vw(2);
          width: 100%;
          h1 {
            font-family: 'Manrope';
          }
          p {
            font-family: 'Nunito';
            font-weight: 600;
          }
        }
        .btn-container {
          margin-top: auto;
          width: 100%;
          height: 15%;
          @extend %centered;
          .proceed-btn {
            font-family: 'Nunito';
            border-radius: 14px;
            background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
            cursor: pointer;
            border: none;
            outline: none;
          }    
        }
      }
      .images-half {
        position: relative;
        flex: 1;
        background-color: $color-accent-lightened;
        @extend %centered;
        .images-carousel {
          width: 90%;
          height: 90%;
          border-radius: 20px;
          overflow: hidden;
          .images-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            position: relative;
            .image-wrapper {
              flex: 1;
              @extend %filler;
              @extend %centered;
              img {
                max-width: 90%;
                max-height: 90%;
              }
            }
          }
        }
        .chevron-left-images-carousel {
          position: absolute;
          @extend %centered;
          top: 50%;
          left: 5%;
          width: 5%;
          height: 10%;
          transform: translate(-50%, -50%);
          background-color: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          svg {
            width: 90%;
            aspect-ratio: 1/1;
          }
        }
        .chevron-right-images-carousel {
          position: absolute;
          @extend %centered; 
          top: 50%;
          left: 95%;
          width: 5%;
          height: 10%;
          transform: translate(-50%, -50%);
          background-color: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          svg {
            width: 90%;
            aspect-ratio: 1/1;
          }
        }
      }
    }
  }
}
.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 6vh;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5vw;
  z-index: 111;
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
          display: flex;
          align-items: center;
          justify-content: center;
          img {
              width: 75%;
          }
      }
  }
  .bar-container {
      position: relative;
      width: 100%;
      height: 10px;
      border: none;
      appearance: none;
      background-color: $color-background-tertiary;
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
.form-section {
  .section-label {
    font-family: 'Nunito';
    font-weight: 600;
  }
  p {
    font-family: 'Nunito';
  }
}
.confirmation-columns-container {
  display: flex;
  @extend %filler;
  .confirmation-column {
    @extend %filler;
    display: flex;
    flex-direction: column;
    row-gap: px-to-vw(20);
  }
}
.confirmation-field {
  font-family: 'Nunito';
  font-size: px-to-vw(14);
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
.form-input {
  width: 100%;
  padding: 0.5vw 1vw;
  border-radius: 20px;
  border: 1px solid lightgray;
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
    display: flex;
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
@media screen and (min-width: 1025px) {
  .option-btn {
    font-size: px-to-vw(15);
    padding: 0.5vw 0.75vw;
    svg {
      width: 1vw;
    }
  }
  .header-wrapper {
    h1 {
      font-size: px-to-vw(40);
    }
    p {
      font-size: px-to-vw(15);
    }
  }
  .btn-container {
    .proceed-btn {
      padding: 0.5vw 1vw;
      font-size: px-to-vw(20);
    }
  }
  .form-section {
    .section-label {
      font-size: px-to-vw(20);
    }
    p {
      font-size: px-to-vw(15);
    }
  }
  .image-half {
    flex: 1;
  }
  .images-half {
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }
  .sidebar {
    display: flex;
  }
  .navbar {
    display: none;
  }
  .grid-container {
    grid-template-columns: repeat(20, 1fr);
  }
  .filter-dropdown {
    width: 12vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(16);
    }
  }
  .label-track {
    label {
      font-size: px-to-vw(13);
    }
    .reset-btn {
      font-size: px-to-vw(10);
    }
  }
  .selection-track {
    font-size: px-to-vw(11);
  }
  .search-input {
    font-size: px-to-vw(15);
  }
  .submit-track {
    button {
      font-size: px-to-vw(10);
      cursor: pointer;
      padding: 0.5vw;
      text-wrap: nowrap;
      width: 40%;
    }
  }
  .delete-btn {
    svg {
      width: 20%;
    }
  }
}
@media screen and (max-width: 1025px) {
  .option-btn {
    font-size: px-to-vw(35);
    padding: 1vw 1.5vw;
    svg {
      width: 1.75vw;
    }
  }
  .image-half {
    flex: 0;
  }
  .slide-container {
    flex-direction: column;
  }
  .images-half {
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }
  .sidebar {
    display: none;
  }
  .navbar {
    display: flex;
  }
  .filter-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(50);
    }
  }
  .label-track {
    label {
      font-size: px-to-vw(40);
    }
    .reset-btn {
      font-size: px-to-vw(30);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
  .search-input {
    font-size: px-to-vw(35);
  }
  .submit-track {
    button {
      font-size: px-to-vw(35);
      cursor: pointer;
      padding: 1vw;
      text-wrap: nowrap;
      width: 40%;
    }
  }
  .delete-btn {
    svg {
      width: 90%;
    }
  }
  .btn-container {
    .proceed-btn {
      padding: 1vw 2vw;
      font-size: px-to-vw(40);
    }
  }
}
@media screen and (max-width: 950px) {
  .option-btn {
    font-size: px-to-vw(35);
    padding: 1vw 1.5vw;
    svg {
      width: 1.8vw;
    }
  }
  .btn-container {
    .proceed-btn {
      padding: 1vw 2vw;
      font-size: px-to-vw(40);
    }
  }
  .page-header {
    font-size: px-to-vw(50);
  }
  .meta-button {
    height: 31%;
    margin-left: 3.5vw;
  }
  .filter-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(40);
    }
  }
  .label-track {
    label {
      font-size: px-to-vw(45);
    }
    .reset-btn {
      font-size: px-to-vw(20);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
  .search-input {
    font-size: px-to-vw(35);
  }
  .submit-track {
    button {
      font-size: px-to-vw(35);
      cursor: pointer;
      padding: 1vw;
      text-wrap: nowrap;
      width: 40%;
    }
  }
  .delete-btn {
    svg {
      width: 90%;
    }
  }
}
@media screen and (max-width: 550px) {
  .option-btn {
    font-size: px-to-vw(40);
    padding: 1.5vw 1.75vw;
    svg {
      width: 2.5vw;
    }
  }
  .page-header {
    font-size: px-to-vw(70);
  }
  .header-wrapper {
    h1 {
      font-size: px-to-vw(90);
    }
    p {
      font-size: px-to-vw(50);
    }
  }
  .btn-container {
    .proceed-btn {
        padding: 1.5vw 3vw;
        font-size: px-to-vw(50);
      }
    }
  .form-section {
    .section-label {
      font-size: px-to-vw(60);
    }
    p {
      font-size: px-to-vw(30);
    }
  }
  .meta-button {
    height: 32%;
    margin-left: 4vw;
  }
  .filter-dropdown {
    width: 40vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(60);
    }
  }
  .label-track {
    label {
      font-size: px-to-vw(45);
    }
    .reset-btn {
      font-size: px-to-vw(20);
    }
  }

  .selection-track {
    font-size: px-to-vw(35);
  }
  .search-input {
    font-size: px-to-vw(40);
  }
  .submit-track {
    button {
      font-size: px-to-vw(40);
      cursor: pointer;
      padding: 1vw;
      text-wrap: nowrap;
      width: 35%;
    }
  }
  .delete-btn {
    svg {
      width: 75%;
    }
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
}
</style>