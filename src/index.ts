import { KeyboardShortcutHints } from "./KeyboardShortcutHints";

const keyboardShortcutHints = new KeyboardShortcutHints();

document.body.addEventListener("keydown", (event: KeyboardEvent) => {
  if (keyboardShortcutHints.isActive()) {
    return;
  }

  // Don't do anything if any modifier keys are pressed
  if (
    event.getModifierState("Control") ||
    event.getModifierState("Shift") ||
    event.getModifierState("Alt") ||
    event.getModifierState("Meta")
  ) {
    return;
  }

  if (event.code === "KeyF") {
    if (isTextInputElement(document.activeElement) === false) {
      keyboardShortcutHints.start();
    }
  }
});

function isTextInputElement(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element instanceof HTMLInputElement && element.selectionStart != null) {
    return true;
  }

  return false;
}
