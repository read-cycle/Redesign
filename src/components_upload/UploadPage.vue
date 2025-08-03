<script setup lang="ts">
import '@vueform/multiselect/themes/default.css'
import Multiselect from '@vueform/multiselect'
import { onMounted, ref, watch } from 'vue';

const ISBNOptions = [
  'Subject',
  'Grade',
  'Date'
];

const selectedISBN = ref();

const gradeOptions = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

const titleOptions = [
    'Hodder',
    'Oxford'
]

const selectedTitle = ref()

const selectedGrade = ref();

const tagOptions = ['Cambridge', 'IGCSE', 'NCERT', '2023 Edition', 'Used', 'New'];
const selectedTags = ref([]);

const progress = ref(0)

function updateProgress(delta: number) {
  progress.value = Math.min(100, Math.max(0, progress.value + delta))
}

onMounted(() => {
    watch([selectedISBN, selectedTitle, selectedGrade, selectedTags], ([newISBN, newTitle, newGrade, newTags], [oldISBN, oldTitle, oldGrade, oldTags]) => {
        let delta = 0;

        if (newISBN && !oldISBN) delta += 20;
        if (!newISBN && oldISBN) delta -= 20;

        if (newTitle && !oldTitle) delta += 20;
        if (!newTitle && oldTitle) delta -= 20;

        if (newGrade && !oldGrade) delta += 20;
        if (!newGrade && oldGrade) delta -= 20;

        const newLen = newTags.length;
        const oldLen = oldTags.length;

        if (newLen > 0 && oldLen === 0) delta += 20;
        if (newLen === 0 && oldLen > 0) delta -= 20;

        updateProgress(delta);
    })
})
</script>
<template>
<div class="upload-container">
    <div class="progress-container">
        <div class="slide-number-container">
            <p class="slide-number"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-a-icon lucide-book-a"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="m8 13 4-7 4 7"/><path d="M9.1 11h5.7"/></svg></p>
        </div>
        <div class="bar-container">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
    </div>
    <div class="main-container">
        <div class="text-container">
            <h1 class="text-container-header">Enter Book Details</h1>
            <div class="form-section">
                <p>ISBN</p>
                <Multiselect 
                  v-model="selectedISBN" 
                  :options="ISBNOptions" 
                  :searchable="true"
                  placeholder="Enter ISBN" 
                  class="multiselect"
                /> 
            </div>
            <div class="form-section">
                <p>Book Title</p>
                <Multiselect 
                  v-model="selectedTitle" 
                  :options="titleOptions" 
                  :searchable="true"
                  placeholder="Enter Book Title" 
                  class="multiselect"
                /> 
            </div>
            <div class="form-section">
                <p>Grade</p>
                <Multiselect 
                  v-model="selectedGrade" 
                  :options="gradeOptions" 
                  :searchable="true"
                  placeholder="Enter Grade" 
                  class="multiselect"
                /> 
            </div>
            <div class="form-section">
                <p>Tags</p>
                <Multiselect 
                  v-model="selectedTags" 
                  :options="tagOptions" 
                  :searchable="true"
                  mode="tags"
                  :multiple="true"
                  :taggable="true"
                  placeholder="Enter Tags" 
                  class="multiselect"
                /> 
            </div>
            <div class="form-section">
                <p>Extra Information</p>
                <textarea></textarea>
            </div>
            <div class="form-section button-section">
                <button class="next-btn">Next Section <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-right-icon lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></button>
            </div>
        </div>
        <div class="graphic-container">

        </div>
    </div>
</div>
</template>
<style lang="scss" scoped>
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
    background-color: $color-background-secondary;
    overflow: hidden;
    .progress-container {
        position: absolute;
        top: 0;
        left: 0;
        height: 10%;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0.5rem;
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
                svg {
                    width: 50%;
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
    .main-container {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .text-container {
            width: 50%;
            height: 100%;
            padding: 1rem;
            padding-top: 4.5%;
            display: flex;
            flex-direction: column;
            row-gap: 2%;
            .text-container-header {
                font-family: 'Manrope';
                color: $color-accent;
                font-size: px-to-vw(40);
            }
            .form-section {
                display: flex;
                flex-direction: column;
                row-gap: px-to-vw(5);
                p {
                    font-family: 'Nunito';
                    font-size: px-to-vw(15);
                }
                textarea {
                    border: 1px solid rgba(211, 211, 211, 0.5);
                    border-radius: 10px;
                    outline: none;
                    font-family: 'Nunito';
                }
            }
            .button-section {
                align-items: center;
                justify-content: center;
                button {
                    width: fit-content;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    color: $color-text;
                    border-radius: 14px;
                    background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
                    font-size: px-to-vw(15);
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
                    }
                }
            }
        }
        .graphic-container {
            width: 50%;
            height: 100%;
            background-color: $color-accent-lightened;
        }
    }
}
.multiselect {
  font-family: 'Nunito';
  border: none;
  outline: none;
  transition: background 1s ease;
  width: 100%;
  font-size: px-to-vw(15);

  ::v-deep .multiselect-tag {
    font-size: px-to-vw(10);
    background-color: $color-primary;
  }

  ::v-deep .multiselect-tags-search {
    background-color: #fff;
    color: $color-text;
  }

  ::v-deep .multiselect-dropdown {
    background-color: $color-background-secondary;
    color: $color-text;
    border: none;

    .multiselect-option {
      background-color: $color-background-secondary;
      color: $color-text;
    }

    .multiselect-option.is-pointed {
      background-color: $color-background-secondary;
      color: black !important;
    }

    .multiselect-no-results {
      color: $color-text !important;
    }
  }
}
::v-deep .multiselect-caret {
  z-index: 9;
}
::v-deep .multiselect.is-active {
  border: none !important;
  box-shadow: none !important;
}
</style>