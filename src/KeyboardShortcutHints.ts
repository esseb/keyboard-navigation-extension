// @ts-ignore
import isElementVisible from "is-element-visible";

interface NavigationHint {
  [key: string]: {
    element: HTMLElement;
    hint: HTMLDivElement;
  };
}

export class KeyboardShortcutHints {
  private active = false;
  private containerElement?: HTMLDivElement;
  private navigationShortcuts: NavigationHint = {};

  constructor() {
    document.body.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("scroll", this.handleScroll);
  }

  public start() {
    if (this.active === true) {
      return;
    }

    this.active = true;
    this.createContainerElement();
    this.createNavigationShortcuts();
  }

  public stop() {
    if (this.active === false) {
      return;
    }

    this.active = false;
    this.destroyContainerElement();
  }

  public isActive() {
    return this.active;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.active === false) {
      return;
    }

    if (event.code === "Escape") {
      this.stop();
      return;
    }

    this.handleInput(event);
  };

  private handleScroll = () => {
    this.stop();
  };

  private handleInput = (event: KeyboardEvent) => {
    const currentKey = event.key.toUpperCase();

    const currentShortcut = this.navigationShortcuts[currentKey];
    if (currentShortcut) {
      currentShortcut.hint.classList.add(
        "keyboard-navigation-extension__shortcut-hint--active"
      );

      currentShortcut.element.click();

      setTimeout(() => {
        this.stop();
      }, 100);
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
        line-height: 1;
        padding: 0.05em 0.15em;
        position: absolute;
        transform: translateY(-50%);
      }

      .keyboard-navigation-extension__shortcut-hint--active {
        transform: translateY(-50%) scale(1.4);
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
    if (this.containerElement == null) {
      return;
    }

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

      const keyboardShortcut = this.getNextKeyboardShortcut();

      if (keyboardShortcut != null) {
        const shortcutHint = this.createNavigationShortcutHint(
          this.containerElement,
          inputElement,
          keyboardShortcut
        );
        this.containerElement.appendChild(shortcutHint);

        this.navigationShortcuts[keyboardShortcut] = {
          element: inputElement,
          hint: shortcutHint
        };
      }
    }
  }

  private createNavigationShortcutHint(
    containerElement: HTMLDivElement,
    inputElement: HTMLElement,
    keyboardShortcut: string
  ) {
    const containerElementRect = containerElement.getBoundingClientRect();

    // We use the first client rect instead of the bounding client rect
    // because in the case of links that wrap over multiple lines
    // we want to show the shortcut hint to the left of the first
    // line of the link text.
    const inputElementRects = inputElement.getClientRects();
    const firstInputElementRect = inputElementRects[0];

    // Clip top, bottom, and height since the element
    // might be partially scrolled out of view.
    const inputElementTop = Math.max(firstInputElementRect.top, 0);
    const inputElementBottom = Math.min(
      firstInputElementRect.bottom,
      containerElementRect.bottom
    );
    const inputElementHeight = inputElementBottom - inputElementTop;

    const shortcutHint = document.createElement("div");
    shortcutHint.className = "keyboard-navigation-extension__shortcut-hint";
    shortcutHint.textContent = keyboardShortcut;
    shortcutHint.style.top = `${inputElementTop + inputElementHeight / 2}px`;
    shortcutHint.style.left = `${firstInputElementRect.left}px`;

    // Use the same font size as the input element itself
    shortcutHint.style.fontSize = window.getComputedStyle(
      inputElement
    ).fontSize;

    return shortcutHint;
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

const inputElementSelectors = [
  "a",
  "button",
  "input[type='button']",
  "input[type='submit']",
  "summary"
];

function getAllInputElements() {
  const selector = inputElementSelectors.join(",");
  return document.querySelectorAll<HTMLElement>(selector);
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
