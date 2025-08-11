interface HTMLElementWithHandler extends HTMLElement {
  __clickOutsideHandler__?: (e: MouseEvent) => void;
}

export default {
  mounted(el: HTMLElementWithHandler, binding: any) {
    const { handler, exclude = [] } = binding.value;

    el.__clickOutsideHandler__ = (e: MouseEvent) => {
      const path = e.composedPath() as Node[];
      
      if (path.includes(el)) return;

      const isExcluded = exclude.some((refEl: HTMLElement) => refEl && path.includes(refEl));
      if (isExcluded) return;

      handler(e);
    };

    document.addEventListener("click", el.__clickOutsideHandler__);
  },

  unmounted(el: HTMLElementWithHandler) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener("click", el.__clickOutsideHandler__);
    }
  }
};