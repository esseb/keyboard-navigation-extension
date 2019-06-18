interface NavigationHint {
  [key: string]: Element;
}

class KeyboardNavigationExtension {
  private active = false;
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
    this.destroyContainerElement();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.destroy();
      return;
    }

    // Only respond when the user presses the "F" key
    if (event.code !== "KeyV") {
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

    inputElements.forEach(inputElement => {
      const nextKeyboardShortcut = this.getNextKeyboardShortcut();

      if (nextKeyboardShortcut != null) {
        this.navigationShortcuts[nextKeyboardShortcut] = inputElement;
      }
    });
  }

  private createNavigationShortcutHints() {
    if (this.containerElement == null) {
      return;
    }

    for (const navigationShortcut in this.navigationShortcuts) {
      const navigationShortcutElement = this.navigationShortcuts[
        navigationShortcut
      ];
      const navigationShortcutRect = navigationShortcutElement.getBoundingClientRect();

      const navigationShortcutHint = document.createElement("div");
      navigationShortcutHint.className =
        "keyboard-navigation-extension__shortcut-hint";
      navigationShortcutHint.textContent = navigationShortcut;
      navigationShortcutHint.style.top = `${navigationShortcutRect.top +
        navigationShortcutRect.height / 2}px`;
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

    const charCodeA = 65;
    return String.fromCharCode(charCodeA + numberOfNavigationShortcuts);
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
