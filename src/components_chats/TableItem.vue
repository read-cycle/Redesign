<script setup lang="ts">
import { type DocumentReference } from 'firebase/firestore';
import { type BuyerRequestedDoc } from '../interfaces';

const props = defineProps<{
  docData: [DocumentReference, BuyerRequestedDoc],
  uploader: boolean
}>();
</script>
<template>
    <li class="table-item">
        <div class="item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary-icon lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
        </div>
        <div class="item-text">
          <h1 class="item-header">{{ props.docData?.[1]?.title?.name }}</h1>
          <h3 class="item-grade">{{ props.docData?.[1]?.grade?.name }}</h3>
          <h3 class="item-grade">{{ uploader ? props.docData?.[1]?.buyerName : props.docData?.[1]?.uploaderName }}</h3>
        </div>
        <div class="metadata-container">
          <p>₹{{ props.docData?.[1]?.priceMode?.code == 'priced' ? props.docData?.[1]?.price : 'Free' }}</p>
        </div>
    </li>
</template>
<style lang="scss" scoped>
.table-item {
  width: 100%;
  height: 27.5%;
  display: flex;
  border-bottom: 1px solid lightgray;
  cursor: pointer;
  .item-icon {
    width: 20%;
    height: 100%;
    @extend %centered;
    color: $color-primary-darkened-2;
  }
  .item-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 55%;
    height: 100%;
    .item-header {
      font-size: px-to-vw(15);
      font-family: 'Manrope';
      color: $color-accent;
      max-width: 100%;
      text-overflow: ellipsis;
      text-wrap: nowrap;
      white-space: nowrap;
      overflow: hidden;
    }
    .item-grade {
      font-size: px-to-vw(12);
      font-family: 'Nunito';
      font-weight: 300;
    }
  }
  .metadata-container {
    width: 25%;
    height: 100%;
    @extend %centered;
    font-family: 'Nunito';
    font-size: px-to-vw(12);
  }
}
</style>