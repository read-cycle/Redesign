<template>
<div class="contact-us-container" id="contact-us">
<div class="text-half half">
  <h2 class="text-half-heading">Get in Touch</h2>
  <p class="text-half-subheading">
    Questions? Suggestions? Plane full of books headed my way? I'm all ears.
  </p>
  <p class="text-half-para">
    Whether you're looking for a book, want to suggest a feature, or just feel like saying hi — drop a message below!
  </p>

  <form class="contact-form">
    <div class="form-grid">
      <label>
        Name<br>
        <input type="text" name="name" required placeholder="e.g. Nikhil Singh">
      </label>
      
      <label>
        Grade/Class<br>
        <input type="text" name="grade" required placeholder="e.g. Grade 11">
      </label>
      
      <label>
        Email<br>
        <input type="email" name="email" required placeholder="e.g. you@example.com">
      </label>
  
      <label>
        Message<br>
        <textarea name="message" rows="4" required placeholder="What's on your mind?"></textarea>
      </label>
    </div>
    <p class="mail-para"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg> readcycle-inv@gmail.com</p>
    <div class="form-button-row">
      <button type="submit">Send Message</button>
    </div>
  </form>
</div>
    <div class="image-half half">
        <div class="image-half-img">

        </div>
    </div>
</div>
</template>
<style lang="scss" scoped>
@function px-to-vw($px, $viewport: 1920) {
  @return calc(#{$px} / #{$viewport} * 100vw);
}
.contact-us-container {
    position: relative;
    width: 100%;
    height: 100dvh;
    background-color: $color-background;
    display: flex;
}
.half {
    width: 50%;
    height: 100%;
}
.text-half {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    padding: 4rem;
    row-gap: 10px;
}
.text-half-heading {
    font-size: px-to-vw(60);
    font-family: 'Manrope';
    color: $color-accent;
    .sl-imp {
        text-decoration: underline 3px $color-accent-lightened;
        font-weight: 800;
    }
}
.text-half-subheading, .text-half-para, .contact-form {
    font-family: 'Nunito';
}
.text-half-subheading {
    font-size: px-to-vw(25);
}
.text-half-para {
  font-size: px-to-vw(16);
}
.contact-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  font-family: 'Nunito';
}
.form-grid label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  font-size: px-to-vw(10);
}
.form-grid input {
    border-radius: 10px;
    padding: 0.5rem;
    border: 1px lightgray solid;
}
.form-grid textarea {
  resize: vertical;
  min-height: 100px;
  grid-column: span 2;
  font-family: 'Nunito';
  border-radius: 10px;
  padding: 0.5rem;
  border: 1px lightgray solid;
}
.form-button-row {
  display: flex;
  justify-content: center;
}
.contact-form button {
  padding: 0.75rem 1.5rem;
  font-size: px-to-vw(15);
  border: none;
  background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
  border-radius: 0.5rem;
  cursor: pointer;
  border: 3px solid $color-background;
  transition: box-shadow 0.4s ease;
  &:hover {
    box-shadow: 0 0 0 3px $color-primary;
  }
}
.image-half {
    position: relative;
    background-color: $color-accent-lightened;
    .image-half-img {
        position: absolute;
        bottom: 0;
        left: -12%;
        width: 100%;
        aspect-ratio: 835/542;
        background-image: url(@/assets/images/planepelt.svg);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
    }
}
.mail-para {
    position: absolute;
    bottom: 3rem;
    left: 3rem;
    display: flex;
    column-gap: 10px;
    align-items: center;
    font-size: px-to-vw(16);
}
</style>