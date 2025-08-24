<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import { nextTick, ref, watch, type Ref } from 'vue';
import TableItem from './TableItem.vue';
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import type { BuyerRequestedDoc, ChatDisplayItem, Message } from '../interfaces';
import { auth, db, storage } from '../firebase-init';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';
import success from '../assets/icons/check-big.svg?raw';
import failure from '../assets/icons/circle-x.svg?raw';
import Navbar from '../components/Navbar.vue';

let userID: string | null = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    
    userID = user.uid;

    const matchedUploaderDocs = query(
      collection(db, 'matched'),
      where('uploaderID', '==', userID),
      orderBy('timestamp', 'desc')
    );
    getDocs(matchedUploaderDocs).then((result) => {
      uploaderDocsData.value = result.docs.map((doc) => {
        const data = doc.data() as BuyerRequestedDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, BuyerRequestedDoc];
      });
    });

    const matchedBuyerDocs = query(
      collection(db, 'matched'),
      where('buyerID', '==', userID),
      orderBy('timestamp', 'desc')
    );
    getDocs(matchedBuyerDocs).then((result) => {
      buyerDocsData.value = result.docs.map((doc) => {
        const data = doc.data() as BuyerRequestedDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, BuyerRequestedDoc];
      });
    });

  } else {
    router.push('/login')
  }
})

const uploaderDocsData: Ref<[DocumentReference, BuyerRequestedDoc][] | undefined> = ref()
const buyerDocsData: Ref<[DocumentReference, BuyerRequestedDoc][] | undefined> = ref()


function formatTime(ts: Timestamp | Date) {
  if (!ts) return '';
  const date = 'toDate' in ts ? ts.toDate() : ts;

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hours}:${minutesStr}${ampm}`;
}

const inputData: Ref<string | null> = ref(null);
const currentDoc: Ref<[DocumentReference, BuyerRequestedDoc] | undefined> = ref();
const messages: Ref<Message[]> = ref([])
const displayItems: Ref<ChatDisplayItem[]> = ref([])

const unsub: Ref<any> = ref()

watch(currentDoc, (newVal) => {
  if(!newVal) return
  unsub.value = onSnapshot(query(collection(newVal[0], 'messages'), orderBy('timestamp', 'asc')), (snapshot) => {
    messages.value = snapshot.docs.map(x => x.data() as Message);
  })
})

async function sendMessage() {
  if (!currentDoc.value) return;
  if(!inputData.value && !fileInputRef.value?.files?.[0]) return

  console.log("SENDING")

  const [docRef, docData] = currentDoc.value;

  let baseRef = null;

  try {

    if(inputData.value)

      baseRef = await addDoc(collection(docRef, 'messages'), {
        text: inputData.value,
        sender:  buyerDocsData.value?.includes(currentDoc.value) ? docData.buyerName : docData.uploaderName,
        timestamp: serverTimestamp(),
        type: 'text',
        senderID: userID
      });

    if(fileInputRef.value?.files?.[0]) {

      if(baseRef) {

        const listingImageRef = storageRef(storage, `matched/${docRef.id}/${baseRef.id}`);
        await uploadBytes(listingImageRef, fileInputRef.value.files[0]);
        const url = await getDownloadURL(listingImageRef);

        await updateDoc(baseRef, {
          imageUrl: url,
          type: 'text+image'
        });
        
      } else {

        const messageRef = await addDoc(collection(docRef, 'messages'), {
          sender:  buyerDocsData.value?.includes(currentDoc.value) ? docData.buyerName : docData.uploaderName,
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
    fileList.value = []
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

const isUserScrolling = ref(false);

function handleScroll() {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  isUserScrolling.value = scrollTop + clientHeight + 50 < scrollHeight;
}

const messagesContainer: Ref<HTMLElement | null> = ref(null)

watch(
  () => displayItems.value.length,
  async () => {
    await nextTick();
    if (!isUserScrolling.value && messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }
);

const fileInputRef = ref<HTMLInputElement | null>(null);

function openFileDialog() {
  fileInputRef.value?.click();
}

const fileList: Ref<string[] | null> = ref(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && target.files) {
    fileList.value = Array.from(target.files).map(x => URL.createObjectURL(x))
    console.log('Selected file:', file);
  }
}

watch(messages, (newVal) =>  {
  displayItems.value = []
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
    displayItems.value.push({type: 'message', message: msg});
  })
})
function getTimestampMillis(msg: Message | undefined) {
  return msg?.timestamp?.toMillis() ?? null;
}

function showAuthorTimeBox(i: number) {
  const item = displayItems.value[i];
  const prev = displayItems.value[i - 1];

  const currTs = getTimestampMillis(item?.message);
  const prevTs = getTimestampMillis(prev?.message);

  if (i === 1) return true;
  if (!currTs || !prevTs) return false;
  if (prev?.message?.senderID !== item?.message?.senderID) return true;

  return currTs - prevTs > 5 * 60 * 1000;
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
<div class="grid-container">
  <div class="metabar-container">
    <MetaBar :title="'Chats'" @notif-click="openModal" ref="metaBar"></MetaBar>
  </div>
  <div class="table-container chats-container-1">
    <div class="table-header">
      <div class="table-header-icon-side-chat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins-icon lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>
      </div>
      <div class="table-header-text-side-chat">
        Uploaded By: You
      </div>
    </div>
    <div class="table-data">
      <div class="table-list">
          <TableItem :uploader="true" v-for="doc in uploaderDocsData" :doc-data="doc" @click="currentDoc = doc"></TableItem>
      </div>
    </div>
  </div>
  <div class="table-container chats-container-2">
    <div class="table-header">
      <div class="table-header-icon-side-chat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search-icon lucide-file-search"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/></svg>      </div>
      <div class="table-header-text-side-chat">
        Uploaded By: Others
      </div>
    </div>
    <div class="table-data">
      <div class="table-list">
          <TableItem :uploader="false" v-for="doc in buyerDocsData" :doc-data="doc" @click="currentDoc = doc"></TableItem>
      </div>
    </div>
  </div>
  <div class="table-container main-container-1">
    <div class="table-header chat-header">
      <div class="table-icon" v-if="currentDoc">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary-icon lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
      </div>
      <div class="table-header-text-container">
        <h1 v-if="currentDoc">{{ currentDoc?.[1].title?.name }}</h1>
        <p v-if="currentDoc">Uploaded by: {{ currentDoc?.[1].uploaderName }}</p>
      </div>
      <div class="table-header-text-container right-text-container">
        <div class="metadata-container" v-if="currentDoc">
          <div class="metadata-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap-icon lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
          </div>
          <div class="metadata-text">
            {{ currentDoc?.[1].grade?.name }}
          </div>
        </div>
        <div class="metadata-container" v-if="currentDoc">
          <div class="metadata-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-piggy-bank-icon lucide-piggy-bank"><path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/></svg>
          </div>
          <div class="metadata-text">
            ₹{{ currentDoc?.[1].price }}
          </div>
        </div>      
      </div>
    </div>
    <div class="table-data">
      <div class="chat-wrapper">
        <div class="messages-wrapper" ref="messagesContainer" @scroll="handleScroll">
          <template v-for="(item, i) in displayItems">
            <div class="day-marker" v-if="item.type == 'daymarker'">
              <hr />
              <p>{{ item.dayMarker?.text }}</p>
              <hr />
            </div>
            <div class="message" v-if="item.type == 'message'" :class="{ 'message-me': item.message?.senderID == userID, 'message-other': item.message?.senderID != userID }">
              <div class="author-time-box" v-if="showAuthorTimeBox(i)">
                <div class="author-box">
                  {{ item.message?.sender }}
                </div>
                <div class="time-box">
                  {{ item.message?.timestamp ? formatTime(item.message.timestamp) : '' }}
                </div>
              </div>
              <div class="message-content">
                <div class="message-image-container" v-if="item.message?.imageUrl">
                    <img :src="item.message?.imageUrl"></img>
                </div>
                <div class="message-text-container" v-if="item.message?.text">{{ item.message?.text }}</div>
              </div>
            </div>
          </template>
        </div>
        <div class="input-wrapper" :style="{ height: fileList != undefined && fileList?.length > 0 ? '20%' : '10%'}">
          <div class="files-track" v-if="fileList != undefined && fileList?.length > 0">
            <div class="files-wrapper">
              <div class="file-item" v-for="(file, i) in fileList" :style="{ backgroundImage: `url(${file})` }">
                <div class="cross-btn" @click="fileList?.splice(i, 1)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></div>
              </div>
            </div>
          </div>
          <div class="input-internal-wrapper">
            <div class="input-container">
              <div class="input-box" ref="inputBox">
                <input type="text" placeholder="Write something..." v-model="inputData"  @keyup.enter="sendMessage"></input>
              </div>
              <div class="input-btn">
                <button class="dim-btn emoji-btn"><svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile-plus-icon lucide-smile-plus"><path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/><path d="M16 5h6"/><path d="M19 2v6"/></svg></button>
              </div>
              <div class="input-btn">
                <input type="file" class="attachment-file-input" @change="handleFileChange" ref="fileInputRef"></input>
                <button class="dim-btn attachment-btn" @click="openFileDialog"><svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip-icon lucide-paperclip"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg></button>
              </div>
              <div class="input-btn" ref="sendBtn">
                <button class="send-btn" @click="sendMessage()"><svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  .table-header-text-side-chat {
    font-size: px-to-vw(25);
  }
  .images-half, .image-half {
    flex: 0;
  }
  .sidebar {
    display: none;
  }
  .grid-container {
    padding-bottom: 5vh;
    height: 250%;
    grid-template-columns: repeat(80, 1fr);
    grid-template-rows: repeat(80, 1fr);
  }
  .navbar {
    display: flex;
  }
  .chats-container-1 {
    grid-row: 41/60; 
    grid-column: 14/70;
  }
  .chats-container-2 {
    grid-row: 61/81; 
    grid-column: 14/70;
  }
  .main-container-1 {
    grid-row: 6/40; 
    grid-column: 14/70;
  }
  .metabar-container {
    grid-row: 1 / 5;
    grid-column: 14 / 70;
  }
}
@media screen and (min-width: 1025px) {
  .table-header-text-side-chat {
    font-size: px-to-vw(15);
  }
  .images-half, .image-half {
    flex: 1;
  }
  .grid-container {
    height: 100%;
    padding-left: 5vw;
    grid-template-columns: repeat(40, 1fr);
    grid-template-rows: repeat(40, 1fr);
  }
  .sidebar {
    display: flex;
  }
  .navbar {
    display: none;
  }
  .chats-container-1 {
    grid-row: 7/23; 
    grid-column: 7/13;
  }
  .chats-container-2 {
    grid-row: 24/40; 
    grid-column: 7/13;
  }
  .main-container-1 {
    grid-row: 7/40; 
    grid-column: 14/35;
  }
  .metabar-container {
    grid-row: 1 / 5;
    grid-column: 7 / 35;
  }
}
.grid-container {
  width: 100%;
  display: grid;
  position: relative;
}
.table-container {
    background-color: $color-background-secondary;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
    .chat-header {
      padding: 0 1.25rem;
    }
    .table-header {
        height: 10%;
        width: 100%;
        background-color: $color-secondary-lightened;
        display: flex;
        align-items: center;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        font-family: 'Manrope';
        color: $color-text;
        .table-icon {
          @extend %centered;
          padding: 0.75rem;
          height: 100%;
        }
        .table-header-text-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          h1 {
            font-size: px-to-vw(17);
          }
          p {
            font-size: px-to-vw(12);
          }
        }
        .right-text-container {
          margin-left: auto;
          text-align: right;
          display: flex;
          justify-content: center;
          .metadata-container {
            display: flex;
            justify-content: flex-end;
            column-gap: 5px;
            .metadata-icon {
              @extend %centered;
            }
            .metadata-text {
              font-size: px-to-vw(12);
              font-family: 'Nunito';
              @extend %centered;
            }
          }
        }
        .table-header-icon-side-chat {
          width: 15%;
          height: 100%;
          @extend %centered;
          svg {
            height: 50%;
            aspect-ratio: 1/1;
          }
        }
        .table-header-text-side-chat {
          width: 85%;
          height: 100%;
          display: flex;
          align-items: center;
        }
    }
    .table-data {
      height: 90%;
      width: 100%;
      .table-list {
        width: 100%;
        height: 100%;
        list-style-type: none;
        overflow-y: scroll;
      }
      .chat-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        .messages-wrapper {
          width: 100%;
          height: 100%;
          max-height: 100%;
          padding-bottom: 10%;
          display: flex;
          flex-direction: column;
          row-gap: 7.5px;
          overflow-y: scroll;
          overflow-x: hidden;
          .message {
            max-width: 50%;
            display: flex;
            flex-direction: column;
            font-family: 'Nunito';
            .author-time-box {
              display: flex;
              width: 100%;
              font-size: px-to-vw(12);
              justify-content: space-between;
              column-gap: 10px;
              opacity: 0.8;
              .author-box {
                max-width: 100%;
                text-overflow: ellipsis;
                text-wrap: nowrap;
                white-space: nowrap;
                overflow: hidden;
              }
              .time-box {
                display: flex;
                align-items: flex-end;
                justify-content: flex-end;
              }
            }
            .message-content {
              width: fit-content;
              max-width: 100%;
              padding: px-to-vw(10);
              border-radius: 5px;
              font-size: px-to-vw(14);
              display: flex;
              flex-direction: column;
              row-gap: px-to-vw(10);
              img {
                width: 100%;
                object-fit: contain;
                border-radius: 5px;
                display: block;
              }
              
            }
          }
          .message-me {
            align-self: flex-start;
            display: flex;
            flex-direction: column;
            align-items: start;
            .message-content {
              background-color: $color-primary;
            }
          }
          .message-other {
            align-self: flex-end;
            display: flex;
            flex-direction: column;
            align-items: end;
            .message-content {
              background-color: #ddd;
            }
          }
          .day-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: 10px;
            width: 100%;
            margin: calc(0.5vw - 7.5px) 0;
            p {
              font-size: px-to-vw(14);
              font-weight: 100;
              font-family: 'Nunito';
              white-space: nowrap;
            }
            hr {
                width: 100%;
                height: 1px;
                margin-top: px-to-vw(2.25);
                opacity: 0.5;
            }
          }
        }
        .input-wrapper {
          position: absolute;
          bottom: 1vw;
          left: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background-color: transparent;
          .files-track {
            flex: 1;
            @extend %filler;
            @extend %centered;
            .files-wrapper {
              width: 90%;
              height: 100%;
              display: flex;
              align-items: center;
              overflow-y: visible;
              gap: 0.5rem;        
              .file-item {
                position: relative;
                flex: 0 0 auto;   
                aspect-ratio: 1/1;
                height: 90%;     
                border-radius: 10px;
                background-position: center center;
                background-size: cover;
                background-repeat: no-repeat;  
                .cross-btn {
                  position: absolute;
                  top: -10px;
                  right: -10px;
                  width: 20px;
                  aspect-ratio: 1/1;
                  border-radius: 50%;
                  background-color: $color-background;
                  @extend %centered;
                  cursor: pointer;
                  svg {
                    width: 100%;
                    aspect-ratio: 1/1;
                    color: #ff9b9b;
                  }
                }
              }
            }
          }
          .input-internal-wrapper {
            flex: 1;
            @extend %filler;
            @extend %centered;
          }
          .input-container {
            width: 90%;
            height: 80%;
            border-radius: 5px;
            background-color: $color-background;
            display: flex;
            padding: 0.35vw;
            .input-box {
              width: 100%;
              input {
                width: 100%;
                height: 100%;
                border: none;
                outline: none;
                background-color: transparent;
                padding: 0.25vw 1vw;
                font-family: 'Nunito';
              }
            }
            .input-btn {
              width: fit-content;
              height: 100%;
              @extend %centered;
              button {
                height: 100%;
                aspect-ratio: 1/1;
                border: none;
                outline: none;
                cursor: pointer;
                @extend %centered;
              }
              .send-btn {
                background-color: $color-primary-darkened;
                border-radius: 5px;
                color: white;
                svg {
                  width: 45%;
                  aspect-ratio: 1/1;
                }
              }
              .dim-btn {
                color: rgba(0, 0, 0, 0.5);
                background-color: transparent;
                svg {
                  height: 35%;
                  aspect-ratio: 1/1;
                }
              }
            }
          }
        }
      }
    }
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
.attachment-file-input {
  display: none;
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
</style>