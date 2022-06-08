export const stopEventBubble = (fn=null) => (event) => {
  event.stopPropagation();
  if (fn) {
    fn(event);
  }
};
