// @ts-ignore
import isElementVisible from "is-element-visible";

interface NavigationHint {
  [key: string]: Element;
}

class KeyboardNavigationExtension {
  private active = false;
  private currentInput: string = "";
  private containerElement?: HTMLDivElement;
  private navigationShortcuts: NavigationHint = {};

  constructor() {
    document.body.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("scroll", this.handleScroll);
  }

  private initialize() {
    if (this.active) {
      return;
    }

    this.active = true;
    this.createContainerElement();
    this.createNavigationShortcuts();
    this.createNavigationShortcutHints();
  }

  private destroy() {
    this.active = false;
    this.currentInput = "";
    this.destroyContainerElement();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.destroy();
      return;
    }

    if (this.active) {
      this.handleInput(event);
      return;
    }

    // Only respond when the user presses the "F" key
    if (event.code !== "KeyF") {
      return;
    }

    // Don't do anything if any modifier keys are pressed
    if (
      event.getModifierState("Alt") ||
      event.getModifierState("Control") ||
      event.getModifierState("Meta") ||
      event.getModifierState("Shift")
    ) {
      return;
    }

    this.initialize();
  };

  private handleScroll = () => {
    this.destroy();
  };

  private handleInput = (event: KeyboardEvent) => {
    const currentKey = event.key.toUpperCase();
    this.currentInput = `${this.currentInput}${currentKey}`;

    const currentShortcut = this.navigationShortcuts[this.currentInput];
    if (currentShortcut) {
      this.destroy();

      // @ts-ignore
      currentShortcut.click();
    }
  };

  private createContainerElement() {
    this.containerElement = document.createElement("div");
    this.containerElement.className = "keyboard-navigation-extension";

    const styleElement = document.createElement("style");
    styleElement.textContent = css`
      .keyboard-navigation-extension {
        bottom: 0;
        font-family: Roboto, sans-serif;
        font-weight: bold;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 2147483647;
      }

      .keyboard-navigation-extension__shortcut-hint {
        background-color: white;
        border-radius: 3px;
        box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.3);
        color: mediumblue;
        padding: 0 3px 0 3px;
        position: absolute;
        transform: translateY(-50%);
      }
    `;

    this.containerElement.appendChild(styleElement);
    document.body.appendChild(this.containerElement);
  }

  private destroyContainerElement() {
    if (this.containerElement == null) {
      return;
    }

    this.containerElement.remove();
    this.containerElement = undefined;
    this.navigationShortcuts = {};
  }

  private createNavigationShortcuts() {
    const inputElements = getAllInputElements();

    for (let i = 0; i < inputElements.length; i++) {
      // We only support 26 navigation shortcuts (A-Z)
      if (Object.keys(this.navigationShortcuts).length === 26) {
        break;
      }

      const inputElement = inputElements[i];

      if (
        isElementInViewport(inputElement) === false ||
        isElementVisible(inputElement) === false
      ) {
        continue;
      }

      const nextKeyboardShortcut = this.getNextKeyboardShortcut();

      if (nextKeyboardShortcut != null) {
        this.navigationShortcuts[nextKeyboardShortcut] = inputElement;
      }
    }
  }

  private createNavigationShortcutHints() {
    if (this.containerElement == null) {
      return;
    }

    const containerElementRect = this.containerElement.getBoundingClientRect();

    for (const navigationShortcut in this.navigationShortcuts) {
      const navigationShortcutElement = this.navigationShortcuts[
        navigationShortcut
      ];
      const navigationShortcutRect = navigationShortcutElement.getBoundingClientRect();

      // Clip top, bottom, and height since the element
      // might be partially scrolled out of view.
      const navigationShortcutTop = Math.max(navigationShortcutRect.top, 0);
      const navigationShortcutBottom = Math.min(
        navigationShortcutRect.bottom,
        containerElementRect.bottom
      );
      const navigationShortcutHeight =
        navigationShortcutBottom - navigationShortcutTop;

      const navigationShortcutHint = document.createElement("div");
      navigationShortcutHint.className =
        "keyboard-navigation-extension__shortcut-hint";
      navigationShortcutHint.textContent = navigationShortcut;
      navigationShortcutHint.style.top = `${navigationShortcutTop +
        navigationShortcutHeight / 2}px`;
      navigationShortcutHint.style.left = `${navigationShortcutRect.left}px`;

      // Use the same font size as the link itself
      navigationShortcutHint.style.fontSize = window.getComputedStyle(
        navigationShortcutElement
      ).fontSize;

      this.containerElement.appendChild(navigationShortcutHint);
    }
  }

  private getNextKeyboardShortcut() {
    if (this.navigationShortcuts == null) {
      return;
    }

    const numberOfNavigationShortcuts = Object.keys(this.navigationShortcuts)
      .length;

    // Create shortcut character starting from "A"
    return String.fromCharCode("A".charCodeAt(0) + numberOfNavigationShortcuts);
  }
}

new KeyboardNavigationExtension();

const inputElementSelectors = [
  "a",
  "button",
  "input[type='button']",
  "input[type='submit']"
];

function getAllInputElements() {
  const selector = inputElementSelectors.join(",");
  return document.querySelectorAll(selector);
}

// This tagged template literal only exists so we can benefit
// from extensions like `vscode-styled-components` to get
// syntax highlighting when creating a CSS string.
function css(string: TemplateStringsArray) {
  return string.join();
}

// http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
function isElementInViewport(element: Element) {
  const rect = element.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  const inViewVertically =
    rect.top <= window.innerHeight && rect.top + rect.height >= 0;
  const inViewHorizontally =
    rect.left <= window.innerWidth && rect.left + rect.width >= 0;

  return inViewVertically && inViewHorizontally;
}
