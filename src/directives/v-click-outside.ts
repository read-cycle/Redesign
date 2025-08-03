interface HTMLElementWithHandler extends HTMLElement {
  __clickOutsideHandler__?: (e: MouseEvent) => void;
}

export default {
  mounted(el: HTMLElementWithHandler, binding: any) {
    const { handler, exclude = [] } = binding.value;

    el.__clickOutsideHandler__ = (e: MouseEvent) => {
      const isExcluded = exclude.some((refEl: HTMLElement) =>
        refEl?.contains(e.target as Node)
      );

      if (!el.contains(e.target as Node) && !isExcluded) {
        handler(e);
      }
    };

    document.addEventListener("click", el.__clickOutsideHandler__);
  },

  unmounted(el: HTMLElementWithHandler) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener("click", el.__clickOutsideHandler__);
    }
  }
};