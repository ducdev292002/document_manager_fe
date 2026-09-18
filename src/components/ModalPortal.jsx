import { createPortal } from 'react-dom';

// Renders children into document.body instead of wherever the component
// happens to be mounted. Without this, a `position: fixed` modal breaks if
// ANY ancestor has `transform`, `filter`, or `backdrop-filter` set (all of
// these create a new CSS containing block, which `fixed` then anchors to
// instead of the viewport) - e.g. Header's `backdrop-blur` shrank the
// change-password modal down to the header's own 64px height.
const ModalPortal = ({ children }) => createPortal(children, document.body);

export default ModalPortal;
