import "./assets/css/index.css";
import { defineComponent } from "./runtime/index";
import CButton from "./components/CButton";
import CDialog from "./components/CDialog";
import COverlay from "./components/COverlay";
import CIcon from "./components/CIcon";

defineComponent("c-button", CButton);
defineComponent("c-dialog", CDialog);
defineComponent("c-overlay", COverlay);
defineComponent("c-icon", CIcon);
