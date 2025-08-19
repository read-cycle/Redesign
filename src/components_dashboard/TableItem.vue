<script setup lang="ts">
import { DocumentReference, Timestamp } from 'firebase/firestore';
import type { UploadDoc } from '../interfaces';

const props = defineProps<{
  doc: [DocumentReference, UploadDoc]
}>()

const emit = defineEmits(["delete"])

function formatTimestampToDDMMYY(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function deleteDoc() {
  emit("delete", props.doc[0])
}

</script>
<template>
    <li class="table-item">
        <div class="item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary-icon lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
        </div>
        <div class="item-text">
          <h1 class="item-header">{{ props.doc[1].title?.name }}</h1>
          <h3 class="item-grade">{{ props.doc[1].grade?.name }}</h3>
        </div>
        <div class="item-options">
          <button class="delete-btn" @click="deleteDoc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
        <div class="item-metadata">
          <h4>{{ formatTimestampToDDMMYY(props.doc[1].timestamp) }}</h4>
        </div>
    </li>
</template>
<style lang="scss" scoped>
@media screen and (max-width: 850px) {
  .item-header {
    font-size: px-to-vw(60);
  }
  .item-grade {
    font-size: px-to-vw(40);
  }
  .item-metadata {
    font-size: px-to-vw(40);
  }
}
@media screen and (min-width: 850px) {
  .item-header {
    font-size: px-to-vw(20);
  }
  .item-grade {
    font-size: px-to-vw(14);
  }
  .item-metadata {
    font-size: px-to-vw(12);
  }
}
.table-item {
  width: 100%;
  height: 35%;
  padding: 0.5vw;
  display: flex;
  border-bottom: 1px solid lightgray;
  cursor: pointer;
  .item-icon {
    width: 15%;
    height: 100%;
    @extend %centered;
    color: $color-primary-darkened-2;
  }
  .item-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    height: 100%;
    .item-header {

        font-family: 'Manrope';
        color: $color-accent;
        max-width: 100%;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
    }
    .item-grade {
        font-family: 'Nunito';
        font-weight: 300;
    }
  }
  .item-options {
    width: 15%;
    height: 100%;
    @extend %centered;
    .delete-btn {
      width: 50%;
      aspect-ratio: 1/1;
      border: none;
      outline: none;
      cursor: pointer;
      background-color: transparent;
      @extend %centered;
      svg {
        width: 40%;
        aspect-ratio: 1/1;
        transition: color 1s ease-in-out;
      }
      &:hover {
        svg {
          color: #ff9b9b;
        }
      }    
    }
  }
  .item-metadata {
    margin-left: auto;
    width: 15%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family: 'Nunito';
  }
}
</style>