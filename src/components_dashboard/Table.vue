<script setup lang="ts">
import TableItem from './TableItem.vue';
defineProps({
  header: String,
  icon: String
})
</script>
<template>
<div class="table-container">
    <div class="table-header">
      <div class="table-header-icon" v-html="icon">
      </div>
      <p>{{ header }}</p>
      <div class="options-container">
        <div class="input-box">
          <input class="search-input" placeholder="Search..."/>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-narrow-wide-icon lucide-arrow-down-narrow-wide"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>
      </div>
    </div>
    <div class="table-data">
      <ul class="table-list">
        <TableItem v-for="_i in 5"></TableItem>
      </ul>
    </div>
</div>
</template>
<style lang="scss" scoped>
.table-container {
  grid-row: 13 / 20;
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
</style>