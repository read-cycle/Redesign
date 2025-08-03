<script lang="ts" setup>
import Sidebar from '../components/Sidebar.vue';
import Hero from './Hero.vue';
import Table from './Table.vue';
import MetaBar from '../components/MetaBar.vue';
import StatOption from './StatOption.vue';
const icons = ['<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>']
const tableIcons = ['<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-user-icon lucide-book-user"><path d="M15 13a3 3 0 1 0-6 0"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history-icon lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>']
</script>
<template>
    <Sidebar></Sidebar>
    <div class = "main-grid">
        <div class = "metabar-container">
          <MetaBar :title="'Dashboard'"></MetaBar>
        </div>
        <Hero></Hero>
        <Table style="grid-column: 4/10;" :header="'My Listings'" :icon="tableIcons[0]"></Table>
        <Table style="grid-column: 12/18" :header="'My History'" :icon="tableIcons[1]"></Table>
        <div class="stat-container">
          <StatOption class="stat-light" :header="'Pending'" :text="'12'" :icon="icons[0]"/>
          <StatOption class="stat-normal" :header="'Success'" :text="'5'" :icon="icons[1]" />
          <StatOption class="stat-dark" :header="'Denied'" :text="'2'" :icon="icons[2]"/>
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
}
.metabar-container {
  grid-row: 1/3;
  grid-column: 4 / 18;
}
.stat-container {
  grid-column: 10/12;
  grid-row: 13/20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  row-gap: 10px;
}
.stat-light {
  background-color: lighten($color-primary, 30%);
}
.stat-normal {
  background-color: lighten($color-primary-darkened, 30%);
}
.stat-dark {
  background-color: lighten($color-primary-darkened-2, 30%);
}
</style>