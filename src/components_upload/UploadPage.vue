<script setup lang="ts">
import Multiselect from 'vue-multiselect'
import Navbar from '../components/Navbar.vue';
import {  onMounted, ref, watch, type Ref, computed, isRef, type ComputedRef, onBeforeUnmount  } from 'vue';
import bookSVG from '../assets/icons/book.svg'
import priceSVG from '../assets/icons/pricing.svg'
import locationSVG from '../assets/icons/location.svg'
import infoSVG from '../assets/icons/info.svg'
import photoSVG from '../assets/icons/photo.svg'
import ImageUploader from './ImageUploader.vue';
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import ISBN from 'isbn-utils';
import AutocompletePhoton from './AutocompletePhoton.vue';
import { auth, db, storage } from '../firebase-init'
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, DocumentReference, setDoc, where, query, getDocs } from "firebase/firestore"; 
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRoute, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import type { BuyerRequestedDoc, WatchlistDoc } from '../interfaces';
import { sendEmail } from '../sendEmail';

let userID: string | null = null;
let userEmail: string | null = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userID = user.uid;
    userEmail = user.email;
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

watch(activeSlide, (val) => {
  router.replace({
    query: {
      ...route.query,
      slide: val.toString()
    }
  })
})

const slideIcons = [bookSVG, priceSVG, locationSVG, infoSVG, photoSVG]

const progresses: Ref<number[]> = ref([0, 0, 0, 0, 0])

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

function updateProgress(delta: number) {
  progresses.value[activeSlide.value - 1] = Math.min(100, Math.max(0, progresses.value[activeSlide.value - 1] + delta))
}

const conditionOptions: Ref<{name: string, code: string}[]> = ref([
  { name: "new", code: "new" },
  { name: "like new", code: "like-new" },
  { name: "very good", code: "very-good" },
  { name: "good", code: "good" },
  { name: "acceptable", code: "acceptable" },
  { name: "used", code: "used" }
]);

const selectedCondition: Ref<{name: string, code: string} | undefined> = ref();

const priceMode: Ref<{name: string, code: string} | undefined> = ref();

const priceOptions = ref([
  { name: 'Free', code: 'free' },
  { name: 'Priced', code: 'priced' }
])

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

const conditionDetails: Ref<{name: string, code: string}[]> = ref([]);

const userLocation = ref('');

const shareLocation = ref(true);

const deliveryPreferenceOptions = [{ name: 'Meetup', code: 'meetup' }, { name: 'Delivery', code: 'delivery' }]

const deliveryPreference: Ref<{name: string, code: string}[]> = ref([]);

const price = ref(0);

const quantity = ref(0);

const uploaderName = ref('');

const contactPreferenceOptions =  [{ name: 'Chat', code: 'chat' }, { name: 'Email', code: 'email' }, { name: 'Phone', code: 'phone' }]

const contactPreference: Ref<{name: string, code: string}[]> = ref([]);

const listingImage: Ref<File | null> = ref(null);

const extraImages: Ref<File[] | null> = ref(null);

const extraInfo = ref('');

watch(shareLocation, (newVal) => {
  if (!newVal) {
    userLocation.value = ''
  }
})

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
              'onUpdate:modelValue': (val: { name: string; code: string; }) => selectedCondition.value = val,
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
        label: 'Condition (Tags)',
        data: [
          {
            component: Multiselect,
            props: {
              id: "conditionTags",
              name: "conditionTags",
              modelValue: conditionDetails,
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => conditionDetails.value = val,
              options: conditionDetailTags,
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
                addItem(tagObj, conditionDetailTags, conditionDetails, true)
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
              'onUpdate:modelValue': (val: { name: string; code: string; }) => priceMode.value = val,
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
              onInput: (e: Event) => price.value = +(e.target as HTMLInputElement).value,
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
    header: 'Location & Delivery',
    sections: [
      {
        label: 'Your Location',
        data: [
          {
            component: AutocompletePhoton,
            props: {
              modelValue: userLocation,
              'onUpdate:modelValue': (val: string) => userLocation.value = val,
              disabled: computed(() => !shareLocation.value)
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
              checked: shareLocation,
              onInput: (e: Event) => shareLocation.value = (e.target as HTMLInputElement).checked,
              class: 'share-location-checkbox',
              id: 'share-location-checkbox'
            }
          },
          {
            component: 'label',
            props: {
              innerHTML: 'Share Location to allow people near you to see your book.',
              class: 'share-location-text',
              for: 'share-location-checkbox'
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
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => deliveryPreference.value = val,
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
      {
        label: 'Contact Preference',
        data: [
          {
            component: Multiselect,
            props: {
              modelValue: contactPreference,
              'onUpdate:modelValue': (val: { name: string; code: string; }[]) => contactPreference.value = val,
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
              'onUpdate:modelValue': (val: File) => listingImage.value = val,
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
              'onUpdate:modelValue': (val: File[]) => extraImages.value = val,
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
              text: computed(() =>
                `Tags: ${selectedTags.value.length ? selectedTags.value.map(tag => tag.name).join(', ') : 'None'}`
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
              text: computed(() => `Condition: ${selectedCondition.value?.name || 'Not specified'}`),
              class: 'confirmation-field'
            }
          },
          {
            component: 'p',
            props: {
              text: computed(() =>
                `Condition Details: ${conditionDetails.value.length ? conditionDetails.value.map(tag => tag.name).join(', ') : 'None'}`
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
        label: 'Location & Delivery',
        data: [
          {
            component: 'p',
            props: {
              text: computed(() => `Location: ${userLocation.value || 'Not shared'}`),
              class: 'confirmation-field'
            }
          },
          {
            component: 'p',
            props: {
              text: computed(() => `Delivery Preference: ${deliveryPreference.value.length
                      ? deliveryPreference.value.map(tag => tag.name).join(', ')
                      : 'None' }`),
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
              text: computed(() =>
                `Extra Images: ${Array.isArray(extraImages.value) && extraImages.value.length
                  ? extraImages.value.map(img => img.name).join(', ')
                  : 'None'}`
              ),
              class: 'confirmation-field'
            }
          }
        ]
      }
    ]
  }
]

function nextSlide() {
  setTimeout(() => {
    activeSlide.value++;
  }, 375)
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
        userLocation: userLocation.value || "",
        shareLocation: shareLocation.value,
        deliveryPreference: deliveryPreference.value || "",
        price: price.value || 0,
        quantity: quantity.value || 0,
        uploaderName: uploaderName.value || "",
        contactPreference: contactPreference.value || "",
        extraInfo: extraInfo.value || "",
        uploaderID: userID,
        uploaderEmail: userEmail
      });

      const listingImageUrls: string[] = [];
      const extraImagesUrls: string[] = [];

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

      const watchlistQuery = query(
        collection(db, 'watchlist'),
        where('isbn.code', '==', selectedISBN.value.code)
      )

      let watchlistData: [DocumentReference, WatchlistDoc][] = []

      getDocs(watchlistQuery).then((result) => {
        watchlistData = result.docs.map((doc) => {
          const data = doc.data() as WatchlistDoc;
          return [doc.ref, { id: doc.id, ...data }] as unknown as [DocumentReference, WatchlistDoc];
        });

        watchlistData.forEach((item) => {
          sendEmail(item[1].buyerEmail, 'ReadCycle Confirmation Email', '<h1>Hello</h1>')
        })
      });

      window.alert("Submit Successful.");
    } catch (err) {
      console.error("Error uploading:", err);
      window.alert("Upload failed.");
    }
  } else {
    window.alert("Please fill in all required fields");
    console.log(progresses.value);
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
  document.querySelectorAll(".multiselect").forEach(el => {
    const cleanup = useTeleportDropdown(el as HTMLElement)
    onBeforeUnmount(cleanup)
  })
})
onMounted(() => {
    watch([selectedISBN, selectedTitle, selectedGrade, selectedTags, selectedCondition, conditionDetails, priceMode, price, quantity, deliveryPreference, userLocation, shareLocation, uploaderName, contactPreference, listingImage, extraImages], ([newISBN, newTitle, newGrade, newTags, newCondition, newConditionDetails, newPriceMode, newPrice, newQuantity, newDeliveryPreference, newLocation, newShareLocation, newUploaderName, newContactPreference, newListingImage, newExtraImages], [oldISBN, oldTitle, oldGrade, oldTags, oldCondition, oldConditionDetails, oldPriceMode, oldPrice, oldQuantity, oldDeliveryPreference, oldLocation, oldShareLocation, oldUploaderName, oldContactPreference, oldListingImage, oldExtraImages]) => {
        let delta = 0;

        if (newISBN && !oldISBN) delta += 25;
        if (!newISBN && oldISBN) delta -= 25;

        if (newTitle && !oldTitle) delta += 25;
        if (!newTitle && oldTitle) delta -= 25;

        if (newGrade && !oldGrade) delta += 25;
        if (!newGrade && oldGrade) delta -= 25;

        if (newCondition && !oldCondition) delta += 20;
        if (!newCondition && oldCondition) delta -= 20;
        
        const newConditionDetailsLen = newConditionDetails.length;
        const oldConditionDetailsLen = oldConditionDetails.length;

        if (newConditionDetailsLen > 0 && oldConditionDetailsLen === 0) delta += 20;
        if (newConditionDetailsLen === 0 && oldConditionDetailsLen > 0) delta -= 20;
        
        if (newPriceMode && !oldPriceMode) delta += 20;
        if (!newPriceMode && oldPriceMode) delta -= 20;

        if(newPriceMode && !oldPriceMode && newPriceMode?.code === 'free') {
          delta += 20;
        } else if (oldPriceMode?.code === 'free' && newPriceMode?.code !== 'free') {
          delta -= 20;
        }

        if (newPrice && !oldPrice) delta += 20;
        if (!newPrice  && oldPrice) delta -= 20;

        if (newQuantity && !oldQuantity) delta += 20;
        if (!newQuantity && oldQuantity) delta -= 20;

        if(newShareLocation && !oldShareLocation) {
          delta -= 50;
        } 
        if(!newShareLocation && oldShareLocation) {
          delta += 50;
        }

        if (newLocation && !oldLocation) delta += 50;
        if (!newLocation && oldLocation) delta -= 50;

        if (newUploaderName && !oldUploaderName) delta += 50;
        if (!newUploaderName && oldUploaderName) delta -= 50;

        const newContactPreferenceLen = Array.isArray(newContactPreference) ? newContactPreference.length : 0;
        const oldContactPreferenceLen = Array.isArray(oldContactPreference) ? oldContactPreference.length : 0;

        if (newContactPreferenceLen > 0 && oldContactPreferenceLen === 0) delta += 50;
        if (newContactPreferenceLen === 0 && oldContactPreferenceLen > 0) delta -= 50;

        const newDeliveryLen = newDeliveryPreference.length;
        const oldDeliveryLen = oldDeliveryPreference.length;

        if (newDeliveryLen > 0 && oldDeliveryLen === 0) delta += 50;
        if (newDeliveryLen === 0 && oldDeliveryLen > 0) delta -= 50;

        if (newListingImage && !oldListingImage) delta += 50;
        if (!newListingImage && oldListingImage) delta -= 50;

        const newExtraImagesLen = Array.isArray(newExtraImages) ? newExtraImages.length : 0;
        const oldExtraImagesLen = Array.isArray(oldExtraImages) ? oldExtraImages.length : 0;

        if (newExtraImagesLen > 0 && oldExtraImagesLen === 0) delta += 50;
        if (newExtraImagesLen === 0 && oldExtraImagesLen > 0) delta -= 50;

        const newTagsLen = newTags.length;
        const oldTagsLen = oldTags.length;

        if (newTagsLen > 0 && oldTagsLen === 0) delta += 25;
        if (newTagsLen === 0 && oldTagsLen > 0) delta -= 25;

        updateProgress(delta);
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
</script>
<template>
<Sidebar class="sidebar"></Sidebar>
<Navbar class="navbar"></Navbar>
<div class="grid">
  <div class="metabar-container">
    <MetaBar :title="'Upload'" @notif-click="openModal" ref="metaBar"></MetaBar>
  </div>
</div>
<div class="upload-container">
  <Transition name="fade" mode="out-in">
    <div class="progress-container" v-if="activeSlide !== 6" >
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
            <div class="confirmation-columns-container" v-if="activeSlide == 6">
              <div class="confirmation-column">
                <div class="form-section" v-for="(section, i) in slides[activeSlide - 1].sections.slice(0, 3)" :key="i">
                    <p class="section-label">{{ section.label }}</p>
                    <component v-for="(dataComp, j) in section.data" :key="j" :is="dataComp.component" v-bind="dataComp.props">{{ getText(dataComp) }}</component>
                </div>
              </div>
              <div class="confirmation-column">
                <div class="form-section" v-for="(section, i) in slides[activeSlide - 1].sections.slice(3, 7)" :key="i">
                    <p class="section-label">{{ section.label }}</p>
                    <component v-for="(dataComp, j) in section.data" :key="j" :is="dataComp.component" v-bind="dataComp.props">{{ getText(dataComp) }}</component>
                </div>
              </div>
            </div>
            <div class="data-wrapper-normal" v-if="activeSlide != 6">
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
            <div class="form-section button-section" v-if="activeSlide != 6">
              <button class="next-btn" @click = "nextSlide()">Next Section <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-right-icon lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></button>
            </div>
            <div class="form-section button-section" v-if="activeSlide == 6">
              <button class="next-btn" @click = "submitData()">Submit</button>
            </div>
          </div>
          <div class="graphic-container">

          </div>
        </div>
      </Transition>
    </div>
  </div>
  <div class="slide-number-change">
    <div class="slide-number-list">
      <div class="nav-left" @click="activeSlide > 1 && activeSlide--" :class="{disabled: activeSlide <= 1}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg></div>
      <div class="slide-number-selection" v-for="i in 6" :key="i" @click="activeSlide = i" :class="{active: activeSlide==i}">{{ i }}</div>
      <div class="nav-right" @click="activeSlide < 6 && activeSlide++" :class="{disabled: activeSlide >= 6}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg></div>
    </div>
  </div>
    <div class="modal-confirmation-container" v-if="toggleConfirmationModal">
      <div class="modal-confirmation-content">
        <div class="close-btn" @click="toggleConfirmationModal = false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
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
  top: px-to-vw(20);
  right: px-to-vw(20);
  cursor: pointer;
  z-index: 999;
  width: px-to-vw(50);
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
  .share-location-text {
    font-size: px-to-vw(30);
  }
  .confirmation-field {
    font-size: px-to-vw(40);
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