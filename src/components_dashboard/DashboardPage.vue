<script lang="ts" setup>
import Sidebar from '../components/Sidebar.vue';
import Hero from './Hero.vue';
import Table from './Table.vue';
import MetaBar from '../components/MetaBar.vue';
import StatOption from './StatOption.vue';
const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binoculars-icon lucide-binoculars"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M 22 16 L 2 16"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>']
const tableIcons = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-user-icon lucide-book-user"><path d="M15 13a3 3 0 1 0-6 0"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binoculars-icon lucide-binoculars"><path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M 22 16 L 2 16"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/></svg>']
import { computed, isRef, onMounted, ref, watch, type Ref } from 'vue';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where, type DocumentReference } from 'firebase/firestore';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import { auth, db } from '../firebase-init';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import bookSVG from '../assets/icons/book.svg'
import infoSVG from '../assets/icons/info.svg'
import checkSVG from '../assets/icons/check.svg'
import AutocompletePhoton from '../components_upload/AutocompletePhoton.vue';
import Multiselect from 'vue-multiselect';
import ISBN from 'isbn-utils';
import Navbar from '../components/Navbar.vue';

let userID: string | null = null;
let userEmail: string | null = null;

const pendingData: Ref<[DocumentReference, UploadDoc][]> = ref([]);
const watchData: Ref<[DocumentReference, UploadDoc][]> = ref([]);
const uploadData: Ref<[DocumentReference, UploadDoc][]> = ref([]);

onAuthStateChanged(auth, (user) => {
  if (user) {
    userID = user.uid;
    userEmail = user.email;
    const pendingDocs = query(
      collection(db, 'buyerRequested'),
      where('buyerID', '==', userID),
      orderBy('timestamp', 'desc')
    );

    getDocs(pendingDocs).then((result) => {
      pendingData.value = result.docs.map((doc) => {
        const data = doc.data() as UploadDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
      });
    });

    const watchDocs = query(
      collection(db, 'watchlist'),
      where('buyerID', '==', userID),
      orderBy('timestamp', 'desc')
    );

    getDocs(watchDocs).then((result) => {
      watchData.value = result.docs.map((doc) => {
        const data = doc.data() as UploadDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
      });
    });

    const uploadDocs = query(
      collection(db, 'uploadPool'),
      where('uploaderID', '==', userID),
      orderBy('timestamp', 'desc')
    );

    getDocs(uploadDocs).then((result) => {
      uploadData.value = result.docs.map((doc) => {
        const data = doc.data() as UploadDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
      });
    });
  } else {
    router.push('/login')
  }
})

const toggleModal = ref(false);

const selectedNotif: Ref<[DocumentReference, BuyerRequestedDoc] | null> = ref(null);

function openModal(item: [DocumentReference, BuyerRequestedDoc]) {
  selectedNotif.value = item;
  toggleModal.value = true;
}

const toggleWatchlistModal = ref(false);

function openWatchlistModal() {
  toggleWatchlistModal.value = true;
  console.log("WATCHLIST MODAL OPENING")
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

const slideIcons = [bookSVG, infoSVG, checkSVG]

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

const progressThresholds: number[] = [100, 100, 100]
const progresses: Ref<number[]> = ref([0, 0, 100])

const contactPreferenceOptions =  [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }]
const buyerContactPreference: Ref<{name: string, code: string}[]> = ref([])

const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }]
const buyerDeliveryPreference: Ref<{name: string, code: string}[]> = ref([])

const buyerName = ref('')

const shareBuyerLocation = ref(true)
const buyerLocation = ref('')

const buyerQuantity = ref(1)

function updateProgress(delta: number) {
  progresses.value[activeSlide.value - 1] = Math.min(100, Math.max(0, progresses.value[activeSlide.value - 1] + delta))
}

const activeSlide = ref(1)

const isISBNDisabled = ref(false)
const isTitleDisabled = ref(false)

const ISBNOptions = ref([
  { name: 'Ex1 Thing', code: 'ex1-thing' },
  { name: 'Ex2 Thing', code: 'ex2-thing' },
  { name: 'Ex3 Thing', code: 'ex3-thing' }
]);

const selectedISBN = ref();

watch(selectedISBN, (newISBN) => {
  if(newISBN == null){
    isTitleDisabled.value = false;
    selectedTitle.value = null;
    return
  } else {
    isTitleDisabled.value = true;
  }
  console.log(newISBN.code)
  const raw = newISBN?.code?.replace(/[-\s]/g, '')

  if (ISBN.isValid(raw)) {
    const isbnObj = ISBN.parse(raw) as ISBN.ISBN;
    console.log('Valid ISBN:', isbnObj.asIsbn13())
    fetch(`https://openlibrary.org/isbn/${isbnObj.asIsbn13()}.json`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        const title: string = data.title
        selectedTitle.value = {
          name: title,
          code: title.toLowerCase().replace(/\s+/g, '-')
        };
      })
  } else {
    console.log('Invalid ISBN')
  }
})

const selectedTitle = ref();

watch(selectedTitle, (newTitle) => {
  if(newTitle == null){
    isISBNDisabled.value = false;
    return
  } else if(isTitleDisabled.value == false) {
    isISBNDisabled.value = true;
    selectedISBN.value = null;
  }
})

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
])

const selectedGrade = ref();

let tagOptions: Ref<{name: string, code: string}[]> = ref([
  { name: 'Ex1 Thing', code: 'ex1-thing' },
  { name: 'Ex2 Thing', code: 'ex2-thing' },
  { name: 'Ex3 Thing', code: 'ex3-thing' }
]);
let selectedTags: Ref<{name: string, code: string}[]> = ref([]);

const extraInfo = ref('')

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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => selectedISBN.value = val,
              options: ISBNOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Enter ISBN',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              disabled: isISBNDisabled,
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => selectedTitle.value = val,
              options: titleOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Enter Book Title',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              disabled: isTitleDisabled,
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.replace(/[\s-]/g, '')
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => selectedGrade.value = val,
              options: gradeOptions,
              searchable: true,
              taggable: true,
              placeholder: 'Enter Grade',
              class: 'multiselect',
              label: 'name',
              trackBy: 'code',
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.replace(/[\s-]/g, '')
                }
                addItem(tagObj, gradeOptions, selectedGrade, false)
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => selectedTags.value = val,
              options: tagOptions,
              multiple: true,
              taggable: true,
              searchable: true,
              placeholder: 'Type to search or add tag',
              tagPlaceholder: 'Add this as new tag',
              label: 'name',
              trackBy: 'code',
              class: 'multiselect',
              onTag: (newTag: string) => {
                const tagObj = {
                  name: newTag,
                  code: newTag.replace(/[\s-]/g, '')
                }
                addItem(tagObj, tagOptions, selectedTags, true)
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
              onInput: (e: Event) => buyerName.value = (e.target as HTMLInputElement).value,
              type: 'text',
              placeholder: 'Enter your name',
              class: 'form-input'
            }
          }
        ]
      },
      {
        label: 'Your Location',
        data: [
          {
            component: AutocompletePhoton,
            props: {
              modelValue: buyerLocation,
              'onUpdate:modelValue': (val: string) => buyerLocation.value = val,
              disabled: computed(() => !shareBuyerLocation.value)
            }
          }
        ]
      },
      {
        label: 'Share Location?',
        data: [
          {
            component: 'input',
            props: {
              type: 'checkbox',
              checked: shareBuyerLocation,
              onInput: (e: Event) => shareBuyerLocation.value = (e.target as HTMLInputElement).checked,
              class: 'share-location-checkbox',
              id: 'share-buyer-location-checkbox'
            }
          },
          {
            component: 'label',
            props: {
              innerHTML: 'Allow seller to view your location for delivery/pickup.',
              class: 'share-location-text',
              for: 'share-buyer-location-checkbox'
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

function addItem<T extends object>(
  newItem: T,                        
  optionsRef: Ref<T[]>,              
  selectedRef: Ref<T[] | T | null | undefined>,  
  multiple: boolean                  
) {
  const exists = optionsRef.value.some(opt =>
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

async function nextSlide() {
  if(progresses.value[activeSlide.value - 1] >= progressThresholds[activeSlide.value - 1]) {
    setTimeout(() => {
      activeSlide.value++;
    }, 375);
    if(activeSlide.value == 2) {
      try {
        await addDoc(collection(db, "watchlist"), {
          buyerName: buyerName.value,
          buyerContactPreference: buyerContactPreference.value,
          buyerDeliveryPreference: buyerDeliveryPreference.value,
          shareBuyerLocation: shareBuyerLocation.value,
          buyerLocation: buyerLocation.value,
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
      } catch (err) {
        console.error("Error moving document:", err);
      }
    }
  } else {
    window.alert("Please fill in all required fields.")
  }
}

onMounted(async () => {
  watch(
    [buyerName, buyerDeliveryPreference, buyerContactPreference, shareBuyerLocation, buyerLocation, buyerQuantity, selectedISBN, selectedGrade, selectedTitle, selectedTags],
    (
      [newName, newDelivery, newContact, newShareLoc, newLocation, newQuantity, newISBN, newGrade, newTitle, newTags],
      [oldName, oldDelivery, oldContact, oldShareLoc, oldLocation, oldQuantity, oldISBN, oldGrade, oldTitle, oldTags]
    ) => {    
      let delta = 0;

      if (newISBN && !oldISBN) delta += 25;
      if (!newISBN && oldISBN) delta -= 25;

      if (newTitle && !oldTitle) delta += 25;
      if (!newTitle && oldTitle) delta -= 25;

      if (newGrade && !oldGrade) delta += 25;
      if (!newGrade && oldGrade) delta -= 25;

      const newTagsLen = newTags.length;
      const oldTagsLen = oldTags.length;

      if (newTagsLen > 0 && oldTagsLen === 0) delta += 25;
      if (newTagsLen === 0 && oldTagsLen > 0) delta -= 25;

      if (newName && !oldName) delta += 20;
      if (!newName && oldName) delta -= 20;

      if (newQuantity && !oldQuantity) delta += 20;
      if (!newQuantity && oldQuantity) delta -= 20;

      if(newShareLoc && !oldShareLoc) delta -= 40;
      if(!newShareLoc && oldShareLoc) delta += 40;

      if (newLocation && !oldLocation) delta += 40;
      if (!newLocation && oldLocation) delta -= 40;

      const newContactPreferenceLen = Array.isArray(newContact) ? newContact.length : 0;
      const oldContactPreferenceLen = Array.isArray(oldContact) ? oldContact.length : 0;

      if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0) delta += 20;
      if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0) delta -= 20;

      const newDeliveryLen = newDelivery.length;
      const oldDeliveryLen = oldDelivery.length;

      if (newDeliveryLen > 0 && oldDeliveryLen === 0) delta += 20;
      if (newDeliveryLen === 0 && oldDeliveryLen > 0) delta -= 20;

      updateProgress(delta);
  })
})
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
</script>
<template>
    <Sidebar class="sidebar"></Sidebar>
    <Navbar class="navbar"></Navbar>
    <div class = "main-grid">
        <div class = "metabar-container">
          <MetaBar :title="'Dashboard'" @notif-click="openModal" ref="metaBar"></MetaBar>
        </div>
        <Hero></Hero>
        <Table class="listingTable" :tableType="'listings'" :header="'My Listings'" :icon="tableIcons[0]"></Table>
        <Table class="watchlistTable" @watchlist-click="openWatchlistModal" :tableType="'watchlist'" :header="'Watchlist'" :icon="tableIcons[1]"></Table>
        <div class="stat-container">
          <StatOption class="stat-light" :header="'Pending'" :text="`${pendingData.length}`" :icon="icons[0]"/>
          <StatOption class="stat-normal" :header="'Uploads'" :text="`${uploadData.length}`" :icon="icons[2]" />
          <StatOption class="stat-dark" :header="'Watching'" :text="`${watchData.length}`" :icon="icons[1]"/>
        </div>
    </div>
    <div class="modal-confirmation-container" v-if="toggleModal">
      <div class="modal-confirmation-content">
        <div class="close-btn" @click="toggleModal = false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
        <div class="text-half">
          <h1 class="confirm-header">Your book has been requested!</h1>
          <div class="book-metadata">
            <p><b>Book Requested:</b> {{ selectedNotif?.[1]?.title?.name }}</p>
            <p><b>Books Grade:</b> {{ selectedNotif?.[1]?.grade?.name }}</p>
          </div>
          <div class="requester-data">
            <p><b>Requester Name:</b> {{ selectedNotif?.[1]?.buyerName }}</p>
            <p><b>Requester Location:</b> {{ selectedNotif?.[1].shareBuyerLocation ? selectedNotif?.[1].buyerLocation : "Not Shared" }}</p>
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
    <div class="modal-watchlist-container" v-if="toggleWatchlistModal">
      <div class="modal-watchlist-content">
        <div class="close-btn" @click="toggleWatchlistModal = false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
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
                <p>{{ slides[activeSlide - 1].desc }}</p>
              </div>
              <div class="main-container">
                <div class="other-container-misc" v-if="activeSlide !== 3">
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
            <div class="images-half" v-if="activeSlide !== 3">
            </div>
          </div>
        </transition>
      </div>
    </div>
</template>
<style lang="scss" scoped>
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

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
  width: 100%;
  color: $color-text;
  background-color: $color-background;
  display: grid;
  position: relative;
}
@media screen and (max-width: 1025px) {
  .slide-container {
    display: block;
  }
  .images-half, .image-half {
    flex: 0;
  }
  .sidebar {
    display: none;
  }
  .navbar {
    display: flex;
  }
  .main-grid {
    height:250%;
    grid-template-columns: repeat(80, 1fr);
    grid-template-rows: repeat(80, 1fr);
    padding-bottom: 5dvh;
  }
  .metabar-container {
    grid-row: 1/3;
    grid-column: 20 / 60;
  }
  .listingTable {
    grid-column: 10 / 70;
    grid-row: 42 / 59;
  }
  .watchlistTable {
    grid-column: 10 / 70;
    grid-row: 64 / 81;
  }
  .stat-container {
    grid-column: 10 / 70;
    grid-row: 60 / 63;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  }
  
}
@media screen and (min-width: 1025px) {
  .slide-container {
    display: flex;
  }
  .images-half, .image-half {
    flex: 1;
  }
  .sidebar {
    display: flex;
  }
  .navbar {
    display: none;
  }
  .main-grid {
    height: 100%;
    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(20, 1fr);
    padding-left: 5vw;
  }
  .metabar-container {
    grid-row: 1/3;
    grid-column: 4 / 18;
  }
  .listingTable {
    grid-column: 4/10;
    grid-row: 13 / 20;
  }
  .watchlistTable {
    grid-column: 12/18;
    grid-row: 13 / 20;
  }
  .stat-container {
    grid-column: 10/12;
    grid-row: 13/20;
    grid-template-columns: 1fr;  
    grid-template-rows: repeat(3, 1fr);
  }
}
.stat-container {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: grid;
  gap: 10px;
}
.stat-light {
  background-color: lighten($color-primary, 30%);
}
.stat-normal {
  background-color: lighten($color-primary-darkened, 30%);
}
.stat-dark {
  background-color: lighten($color-primary-darkened-2, 30%);
}

@keyframes draw-svg {
  to {
    stroke-dashoffset: 0;
  }
}
.modal-confirmation-container {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  @extend %filler;
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
    overflow: hidden;
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
.modal-watchlist-container {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  @extend %filler;
  @extend %centered;
  z-index: 9999;
  .modal-watchlist-content {
    position: relative;
    width: 75%;
    height: 80%;
    background-color: $color-background;
    border-radius: 20px;
    display: flex;
    .slide-container {
      @extend %filler;
      .text-half {
        flex: 1;
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
        padding: 1.5vw;
        padding-top: 6vh;
        display: flex;
        flex-direction: column;
        row-gap: px-to-vw(30);
        overflow: hidden;
        .main-container {
          @extend %filler;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          .other-container-misc {
            display: flex;
            flex-direction: column;
            row-gap: px-to-vw(15);
            height: 85%;
            max-height: 85%;
            overflow-y: scroll;
            .form-section {
                font-family: 'Nunito';
                font-size: px-to-vw(14);
                .section-label {
                  align-self: flex-start;
                  font-family: 'Nunito';
                  font-weight: bold;
                }
            }
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
          overflow: hidden;
          margin-top: auto;
          width: 100%;
          height: 15%;
          min-height: 15%;
          @extend %centered;
          padding: 2vw;
          .proceed-btn {
            font-family: 'Nunito';
            border-radius: 14px;
            background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
            cursor: pointer;
            outline: none;
            border: none;
            overflow: hidden;
          }    
        }
      }
      .images-half {
        position: relative;
        background-color: $color-accent-lightened;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
        @extend %centered;
      }
    }
  }
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
.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 6vh;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.45vw;
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
.form-input {
  width: 100%;
  padding: 0.5vw 1vw;
  border-radius: 20px;
  border: 1px solid lightgray;
  font-size: px-to-vw(15);
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

textarea {
  border: 1px solid rgba(211, 211, 211, 0.5);
  border-radius: 10px;
  outline: none;
  font-family: 'Nunito';
  resize: none;
  width: 100%;
  padding: 0.5vw;
}
::-webkit-scrollbar {
  width: 0;
  height: 0.5rem;
}
::-webkit-scrollbar-thumb {
  background-color: $color-primary;
  border-radius: 20px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
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
@media screen and (max-width: 1025px) {
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
  .header-wrapper {
    h1 {
      font-size: px-to-vw(60);
    }
    p {
      font-size: px-to-vw(37.5);
    }
  }
  .proceed-btn {
    padding: 0.75vw 2vw;
    font-size: px-to-vw(57.5);
    svg {
      width: 3vw;
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
  .share-location-text {
    font-size: px-to-vw(30);
  }
}
@media screen and (min-width: 1025px) {
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
  .header-wrapper {
    h1 {
      font-size: px-to-vw(40);
    }
    p {
      font-size: px-to-vw(12);
    }
  }
  .proceed-btn {
    padding: 0.5vw 2vw;
    font-size: px-to-vw(20);
    svg {
      width: 3vw;
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
@media screen and (max-width: 950px) {
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
  .header-wrapper {
    h1 {
      font-size: px-to-vw(80);
    }
    p {
      font-size: px-to-vw(40);
    }
  }
  .proceed-btn {
    padding: 0.75vw 2vw;
    font-size: px-to-vw(57.5);
    svg {
      width: 3vw;
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
  .share-location-text {
    font-size: px-to-vw(30);
  }
  .confirmation-field {
    font-size: px-to-vw(27);
  }
}
@media screen and (max-width: 550px) {
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
  .header-wrapper {
    h1 {
      font-size: px-to-vw(80);
    }
    p {
      font-size: px-to-vw(40);
    }
  }
  .proceed-btn {
    padding: 0.75vw 2vw;
    font-size: px-to-vw(57.5);
    svg {
      width: 3vw;
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
  .share-location-text {
    font-size: px-to-vw(50);
  }
  .confirmation-field {
    font-size: px-to-vw(40);
  }
}
</style>