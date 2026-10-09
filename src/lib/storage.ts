export function subscribeToStorage(eventName: string) {
  return (onStoreChange: () => void) => {
    window.addEventListener(eventName, onStoreChange);
    window.addEventListener("storage", onStoreChange);

    return () => {
      window.removeEventListener(eventName, onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  };
}

export function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function writeStorage(key: string, value: string, eventName: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(eventName));
}

export function emptySnapshot() {
  return "";
}
