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
    keyboardShortcutHints.start();
  }
});
