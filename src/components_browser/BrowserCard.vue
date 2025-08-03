<script setup lang="ts">
import Tag from './Tag.vue';
</script>
<template>
<div class="card-container">
    <div class="image-container">

    </div>
    <div class="text-container">
        <div class="main-text-container">
            <h1 class="text-container-header">Computers Textbook</h1>
            <p class="text-container-para">Grade 2</p>
        </div>
        <div class="metadata-container">
            <p>01/08/2025</p>
        </div>
    </div>
    <div class="tags-container">
        <Tag :text="'Computer Science'"></Tag>
        <Tag :text="'Computer Science'"></Tag>
        <Tag :text="'Computer Science'"></Tag>
    </div>
</div>
</template>
<style lang="scss" scoped>
.card-container {
    grid-row: span 9;
    grid-column: span 5;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background-color: #f9fafb;
    overflow: hidden;
    .image-container {
        height: 60%;
        width: 100%;
        background-image: url('../assets/images/template-temporary.jpeg');
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