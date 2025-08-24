<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore';
import type { UploadDoc } from '../interfaces';
import Tag from './Tag.vue';
const props = defineProps<{
 data: UploadDoc
}>()
function formatTimestampToDDMMYY(ts: Timestamp) {
  const date = ts.toDate()
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
</script>
<template>
<div class="card-container browsercard-container">
    <div class="image-container" :style="{ backgroundImage: `url(${data.listingImage})` }">

    </div>
    <div class="text-container">
        <div class="main-text-container">
            <h1 class="text-container-header">{{ props.data.title?.name }}</h1>
            <p class="text-container-para">{{ props.data.grade?.name }}</p>
        </div>
        <div class="metadata-container">
            <p>{{ formatTimestampToDDMMYY(props.data.timestamp) }}</p>
        </div>
    </div>
    <div class="tags-container">
        <Tag v-for="(tag, i) in props.data.tags" :key="i" :text="tag.name"></Tag>
    </div>
</div>
</template>
<style lang="scss" scoped>
.card-container {
    aspect-ratio: 8/9;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background-color: #f9fafb;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 5px 5px 10px 1px #ccc;
    .image-container {
        height: 60%;
        width: 100%;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
    }
    .text-container {
        height: 30%;
        width: 100%;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        .metadata-container {
            width: 50%;
            height: 100%;
            font-family: 'Nunito';
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
        }
        .main-text-container {
            height: 100%;
            width: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .text-container-header {
                font-size: 22px;
                font-family: 'Manrope';
                color: $color-accent;
                max-width: 100%;
                text-overflow: ellipsis;
                text-wrap: nowrap;
                white-space: nowrap;
                overflow: hidden;
            }
            .text-container-para {
                font-size: 15px;
                font-family: 'Nunito';
                max-width: 100%;
                text-overflow: ellipsis;
                text-wrap: nowrap;
                white-space: nowrap;
                overflow: hidden;        
            }
        }
    }
    .tags-container {
        width: 100%;
        height: 10%;
        padding: 20px 10px;
        overflow-x: scroll;
        overflow-y: hidden;
        display: flex;
        align-items: center;
        column-gap: 5px;
    }
    .tags-container::-webkit-scrollbar {
        height: 4px;
    }

    .tags-container::-webkit-scrollbar-track {
        background: transparent;
    }

    .tags-container::-webkit-scrollbar-thumb {
        background-color: $color-secondary;
        border-radius: 10px;
    }
}
</style>