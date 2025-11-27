<script setup lang="ts">
import { onAuthStateChanged } from 'firebase/auth';
import TableItem from './TableItem.vue';
import { auth, db } from '../firebase-init';
import router from '../router';
import { collection, deleteDoc, DocumentReference, getDocs, orderBy, query, where } from 'firebase/firestore';
import type { UploadDoc } from '../interfaces';
import { ref, type Ref } from 'vue';
const props = defineProps({
  header: String,
  icon: String,
  tableType: String
})
let userID: string | null = null;

const docsData: Ref<[DocumentReference, UploadDoc][]> = ref([]);

onAuthStateChanged(auth, (user) => {
  if (user) {
    userID = user.uid;
    
    if(props.tableType == 'listings') {
      const uploadDocs = query(
        collection(db, 'uploadPool'),
        where('uploaderID', '==', userID),
        orderBy('timestamp', 'desc')
      );

      getDocs(uploadDocs).then((result) => {
        console.log(result)
        docsData.value = result.docs.map((doc) => {
          const data = doc.data() as UploadDoc;
          return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
        });
      });
    } else {
      const uploadDocs = query(
        collection(db, 'watchlist'),
        where('buyerID', '==', userID),
        orderBy('timestamp', 'desc')
      );

      getDocs(uploadDocs).then((result) => {
        docsData.value = result.docs.map((doc) => {
          const data = doc.data() as UploadDoc;
          return [doc.ref, { id: doc.id, ...data }] as [DocumentReference, UploadDoc];
        });
      });
    }
  } else {
    router.push('/login')
  }
})

function handleDelete(docRef: DocumentReference) {
  deleteDoc(docRef)
    .then(() => {
      docsData.value = docsData.value.filter(d => d[0].id !== docRef.id);
    })
}
</script>
<template>
<div class="table-container">
    <div class="table-header">
      <div class="table-header-icon" v-html="icon">
      </div>
      <p class="table-header-text">{{ header }}</p>
      <button class="add-watchlist" v-if="tableType === 'watchlist'" @click="$emit('watchlist-click')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>
      <div class="options-container">
        <div class="input-box">
          <input class="search-input" placeholder="Search..."/>
        </div>
        <button class="option-btn-container"><svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-narrow-wide-icon lucide-arrow-down-narrow-wide"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg></button>
        <button class="option-btn-container"><svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg></button>
      </div>
    </div>
    <div class="table-data">
      <ul class="table-list">
        <TableItem v-for="doc in docsData" :doc="doc" @delete="handleDelete"></TableItem>
      </ul>
    </div>
</div>
</template>
<style lang="scss" scoped>
.table-container {
  background-color: $color-background-secondary;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
  .table-header {
    height: 15%;
    width: 100%;
    background-color: $color-secondary-lightened;
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 0 1.25rem;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    font-family: 'Manrope';
    color: $color-text;
    .table-header-icon {
      @extend %centered;
      ::v-deep svg {
        aspect-ratio: 1/1;
      }
    }
    .table-header-text {
      font-weight: 700;
    }
    .add-watchlist {
      @extend %centered;
      background-color: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      svg {
        aspect-ratio: 1/1;
      }
    }
  }
  .table-data {
    height: 85%;
    width: 100%;
    .table-list {
      width: 100%;
      height: 100%;
      list-style-type: none;
      overflow-y: scroll;
    }
  }
}
::-webkit-scrollbar {
  width: 0.5rem;
}
::-webkit-scrollbar-thumb {
  background-color: $color-secondary;
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
.options-container {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 50%;
  column-gap: 15px;
  color: $color-text;
  .option-btn-container {
    @extend %centered;
    background-color: transparent;
    border: none;
    outline: none;
    svg {
      aspect-ratio: 1/1;
    }
  }
}
.input-box {
  width: 35%;
}
.search-input {
  background-color: transparent;
  border: none;
  outline: none;
  border-bottom: $color-accent 1px solid;
  width: 100%;
}
@media screen and (max-width: 1025px) {
  .table-header-text {
    font-size: px-to-vw(40);
  }
  .search-input {
    font-size: px-to-vw(20);
  }
  .option-btn-container {
    svg {
      width: 1.25vw;
    }
  }
  .add-watchlist {
    svg {
      width: 1.25vw;
    }
  }
  .table-header-icon {
    ::v-deep svg {
      width: 1.25vw;
    }
  }
}
@media screen and (min-width: 1025px) {
  .table-header-text {
    font-size: px-to-vw(15);
  }
  .search-input {
    font-size: px-to-vw(12);
  }
  .option-btn-container {
    svg {
      width: 0.75vw;
    }
  }
  .add-watchlist {
    svg {
      width: 0.75vw;
    }
  }
  .table-header-icon {
    ::v-deep svg {
      width: 0.75vw;
    }
  }
}
@media screen and (max-width: 950px) {
  .table-header-text {
    font-size: px-to-vw(50);
  }
  .search-input {
    font-size: px-to-vw(30);
  }
  .option-btn-container {
    svg {
      width: 2vw;
    }
  }
  .add-watchlist {
    svg {
      width: 2vw;
    }
  }
  .table-header-icon {
    ::v-deep svg {
      width: 2vw;
    }
  }
}
@media screen and (max-width: 550px) {
  .input-box {
    width: 50%;
  }
  .table-header-text {
    font-size: px-to-vw(70);
  }
  .search-input {
    font-size: px-to-vw(60);
  }
  .option-btn-container {
    svg {
      width: 3vw;
    }
  }
  .add-watchlist {
    svg {
      width: 3vw;
    }
  }
  .table-header-icon {
    ::v-deep svg {
      width: 3vw;
    }
  }
}
</style>