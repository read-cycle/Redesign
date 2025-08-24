<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { query, collection, orderBy, DocumentReference, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../firebase-init';
import bell from '../assets/icons/bell.svg?raw'
import bellDot from '../assets/icons/bell-dot.svg?raw'
import type { BuyerRequestedDoc } from '../interfaces';
import { onAuthStateChanged } from 'firebase/auth';
import router from '../router';

let userID: string | null = null;

const docsData: Ref<[DocumentReference, BuyerRequestedDoc][]> = ref([]);

onAuthStateChanged(auth, (user) => {
  if (user) {

    userID = user.uid;
    console.log(userID)

    const uploadDocs = query(
      collection(db, 'buyerRequested'),
      where('uploaderID', '==', userID),
      orderBy('timestamp', 'desc')
    );

    getDocs(uploadDocs).then((result) => {
      docsData.value = result.docs.map((doc) => {
        const data = doc.data() as BuyerRequestedDoc;
        return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, BuyerRequestedDoc];
      });
    });

  } else {
    router.push('/login')
  }
})

defineProps({
    title: String
})

const showNotifs = ref(false);
const notifsBtn = ref(null)

const iconHtml = computed(() => docsData.value.length >= 1 ? bellDot : bell)

</script>
<template>
    <div class="meta-container">
        <h1 class="page-header">{{ title }}</h1>
        <button class="meta-button" ref="notifsBtn" @click="showNotifs = !showNotifs">
        <div class="icon-container" v-html="iconHtml">
            
        </div>
        <div v-if="showNotifs" class="notifications-dropdown">
          <div class="notif-block title-block">
            <label>Notifications</label>
          </div>
          <div class="notif-block" v-for="item in docsData" @click="$emit('notif-click', item)" ref="notifBlocks">
            <div class="label-track">
              <label class="title-label">{{ item[1].title?.name }}</label>
              <label class="grade-label">{{ item[1].grade?.name }}</label>
            </div>
            <div class="selection-track">
                <p>Has a request from {{ item[1].buyerName }}</p>
            </div>
          </div>
        </div>
        </button>
        <button class="meta-button">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </button>
    </div>
</template>
<style lang="scss" scoped>
.meta-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}
.page-header {
    font-family: 'Manrope';
    margin-right: auto;
    color: $color-accent;
}
.meta-button {
    position: relative;
    aspect-ratio: 1/1;
    border: none;
    background-color: transparent;
    cursor: pointer;
    .icon-container {
        @extend %filler;
        @extend %centered;
        ::v-deep svg {
            width: 100%;
        }
    }
}
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  max-height: 40dvh;
  overflow-y: scroll;
  background-color: $color-background;
  border-radius: 10px;
  border: 1px solid rgba(211, 211, 211, 0.5);
  z-index: 999;
  .notif-block {
    width: 100%;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    border-bottom: 1px solid rgba(211, 211, 211, 0.5);
    .label-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Nunito';
      .title-label {
        max-width: 70%;
        width: 70%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-align: left;
      }
      .grade-label {
        max-width: 25%;
        width: 25%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-align: right;
      }
    }
    .submit-track {
      button {
        font-size: 12px;
        cursor: pointer;
      }
      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        padding: 0.5vw;
        column-gap: 5px;
      }
      .apply-btn {
        background-color: $color-primary;
        color: white;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        padding: 0.5vw;
      }
    }
    .selection-track {
      @extend %filler;
      display: flex;
      p {
        font-family: 'Nunito';
      }
    }
  }
  .title-block {
    label {
      font-family: 'Manrope';
    }
  }
}
::-webkit-scrollbar {
    width: 0;
}
@media screen and (max-width: 1025px) {
  .page-header {
    font-size: px-to-vw(60);
  }
  .meta-button {
    height: 30%;
    margin-left: 1.75vw;
  }
  .notifications-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(40);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(35);
    }
    .grade-label {
      font-size: px-to-vw(30);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
}
@media screen and (min-width: 1025px) {
  .page-header {
    font-size: px-to-vw(35);
  }
  .meta-button {
    height: 20%;
    margin-left: 2vw;
  }
  .notifications-dropdown {
    width: 12vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(16);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(13);
    }
    .grade-label {
      font-size: px-to-vw(10);
    }
  }
  .selection-track {
    font-size: px-to-vw(11);
  }
}
@media screen and (max-width: 950px) {
  .page-header {
    font-size: px-to-vw(50);
  }
  .meta-button {
    height: 20%;
    margin-left: 5vw;
  }
  .notifications-dropdown {
    width: 30vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(40);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(35);
    }
    .grade-label {
      font-size: px-to-vw(30);
    }
  }
  .selection-track {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 550px) {
  .page-header {
    font-size: px-to-vw(70);
  }
  .meta-button {
    height: 32%;
    margin-left: 4vw;
  }
  .notifications-dropdown {
    width: 40vw;
  }
  .title-block {
    label {
      font-size: px-to-vw(60);
    }
  }
  .label-track {
    .title-label {
      font-size: px-to-vw(45);
    }
    .grade-label {
      font-size: px-to-vw(35);
    }
  }
  .selection-track {
    font-size: px-to-vw(35);
  }
}
</style>