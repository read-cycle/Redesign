<script lang="ts" setup>
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import BrowserCard from './BrowserCard.vue';
import '@vueform/multiselect/themes/default.css'
import Multiselect from '@vueform/multiselect'
import { ref } from 'vue';
import Datepicker from 'vue3-datepicker'
import vClickOutside from '../directives/v-click-outside'

const fromDate = ref<Date | undefined>(undefined)
const toDate = ref<Date | undefined>(undefined)

const filterButtonRef = ref<HTMLElement | null>(null);
const sortButtonRef = ref<HTMLElement | null>(null);

const subjectOptions = [
  'Math',
  'Biology',
  'Chemistry',
  'Physics',
  'Computer Science',
  'History',
  'Geography',
  'Economics',
  'English Literature'
];

const fieldOptions = [
  'Subject',
  'Grade',
  'Date'
];

const selectedField = ref();

const sortOptions = [
  'Ascending',
  'Descending',
];

const selectedSort = ref();


const selectedSubjects = ref([]);

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

const selectedGrades = ref([]);

const tagOptions = ['Cambridge', 'IGCSE', 'NCERT', '2023 Edition', 'Used', 'New'];
const selectedTags = ref([]);

const searchQuery = ref('');

const showFilters = ref(false);

const showSorts = ref(false);

const today = new Date();

</script>
<template>
    <Sidebar></Sidebar>
    <div class = "main-grid">
        <div class = "metabar-container">
          <MetaBar :title="'Browser'"></MetaBar>
        </div>
        <div class="filters-bar">
          <div class="input-box">
            <p>Searchbar</p>
            <input
              class="search-input"
              type="text"
              placeholder="Search..."
              v-model="searchQuery"
            />
          </div>

          <div class="filters-box">
            <p>Filters</p>
            <div class="option-btn-container">
              <button class="option-btn sort-button" title="Sorting Options" @click="showSorts = !showSorts" ref="sortButtonRef">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-wide-narrow-icon lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
                Sort
              </button>
              <button class="option-btn filter-button" title="More Filters" @click="showFilters = !showFilters" ref="filterButtonRef">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>
                Filter
              </button>
              <div v-if="showFilters" class="filter-dropdown" v-click-outside="{  handler: () => showFilters = false,  exclude: [filterButtonRef]}">
                <div class="filter-block title-block">
                  <label>Filters</label>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Subject</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedSubjects" 
                      :options="subjectOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Subjects" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Grade</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedGrades" 
                      :options="gradeOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Grades" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Date</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track date-selection-track">
                    <Datepicker v-model="fromDate" placeholder="From date" :maxDate="today"/>
                    <Datepicker v-model="toDate" placeholder="To date" :maxDate="today"/>
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Tags</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedTags" 
                      :options="tagOptions" 
                      :multiple="true"
                      :taggable="true"
                      :searchable="true"
                      mode="tags"
                      placeholder="Filter Tags" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block submit-block">
                  <div class="label-track submit-track">
                    <button class="delete-btn"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All</button>
                    <button class="apply-btn">Apply All</button>
                  </div>
                </div>
              </div>
              <div v-if="showSorts" class="filter-dropdown" v-click-outside="{  handler: () => showSorts = false,  exclude: [sortButtonRef]}">
                <div class="filter-block title-block">
                  <label>Sort Options</label>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Sort By</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedField" 
                      :options="fieldOptions" 
                      :searchable="true"
                      placeholder="Sort By" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block">
                  <div class="label-track">
                    <label>Type</label>
                    <label class="reset-btn">Reset</label>
                  </div>
                  <div class="selection-track">
                    <Multiselect 
                      v-model="selectedSort" 
                      :options="sortOptions" 
                      :searchable="true"
                      placeholder="Asc/Desc" 
                      class="multiselect tag-multiselect"
                    /> 
                  </div>
                </div>
                <div class="filter-block submit-block">
                  <div class="label-track submit-track">
                    <button class="delete-btn"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All</button>
                    <button class="apply-btn">Apply All</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class = "grid-container">
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
            <BrowserCard></BrowserCard>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.main-grid {
  @extend %filler;
  color: $color-text;
  background-color: $color-background;
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 1fr);
  position: relative;
  padding-left: 5vw;
  .grid-container {
    grid-row: 5/20;
    grid-column: 4/18;
    display: grid;
    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(36, 1fr);
    gap: 1rem;
    height: 200%;
  }
}
.metabar-container {
  grid-row: 1/3;
  grid-column: 4 / 18;
}
.filters-bar {
  grid-row: 3/5;
  grid-column: 4/18;
  display: flex;
  align-items: center;
  .input-box { 
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    p {
      font-family: 'Nunito';
      font-size: 12px;
    }
  }
  .filters-box {
    position: relative;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    p {
      font-family: 'Nunito';
      font-size: 12px;
    }
  }
}
.multiselect {
  font-family: 'Nunito';
  border: none;
  background: $color-background-secondary;
  outline: none;
  transition: background 1s ease;

  &:hover {
    background-color: $color-background-tertiary;
  }

  ::v-deep .multiselect-tag {
    font-size: 10px;
    background-color: $color-primary;
  }

  ::v-deep .multiselect-tags-search {
    background-color: transparent;
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
.option-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 5px;
  .option-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 5px;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    border: 1px solid lightgray;
    background-color: transparent;
    box-shadow: 1px 1px 10px rgba(211, 211, 211, 0.5);
    cursor: pointer;
    svg {
      color: $color-accent-lightened;
    }
  }
}
.search-input {
  border-radius: 10px;
  padding: 0.5rem;
  border: 1px lightgray solid;
  box-shadow: 1px 1px 10px rgba(211, 211, 211, 0.5);
}
.filter-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 12vw;
  background-color: $color-background;
  border-radius: 10px;
  border: 1px solid rgba(211, 211, 211, 0.5);
  .filter-block {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    border-bottom: 1px solid rgba(211, 211, 211, 0.5);
    .label-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Nunito';
      label {
        font-size: 13px;
      }
      .reset-btn {
        font-size: 10px;
        text-decoration: underline;
        color: $color-accent;
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
        padding: 0.5rem;
        column-gap: 5px;
      }
      .apply-btn {
        background-color: $color-primary;
        color: white;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        padding: 0.5rem;
      }
    }
    .selection-track {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 5px;
    }
  }
  .submit-block {
    padding: 0.5rem !important;
  }
  .title-block {
    label {
      font-family: 'Manrope';
      font-size: 16px;
    }
  }
}
::v-deep .date-selection-track {
  .v3dp__datepicker {
    width: 50%;
    .v3dp__input_wrapper {
      input {
        width: 100%;
        padding: 5px;
        border-radius: 10px;
        border: 1px solid rgba(211, 211, 211);
        background: $color-background-secondary;
      }
    }
  }
}
</style>