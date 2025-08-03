<template>
    <li class="table-item">
        <div class="item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary-icon lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
        </div>
        <div class="item-text">
          <h1 class="item-header">Computer Science</h1>
          <h3 class="item-grade">Grade 2</h3>
        </div>
        <div class="item-type-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
        </div>
        <div class="item-metadata">
          <h4>01/08/2025</h4>
        </div>
    </li>
</template>
<style lang="scss" scoped>
.table-item {
  width: 100%;
  height: 35%;
  padding: 0.5rem;
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
    width: 40%;
    height: 100%;
    .item-header {
        font-size: 20px;
        font-family: 'Manrope';
        color: $color-accent;
    }
    .item-grade {
        font-size: 14px;
        font-family: 'Nunito';
        font-weight: 300;
    }
  }
  .item-type-icon {
    width: 30%;
    height: 100%;
    @extend %centered;
    color: $color-primary-darkened;
  }
  .item-metadata {
    width: 15%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family: 'Nunito';
    font-size: 12px;
  }
}
</style>