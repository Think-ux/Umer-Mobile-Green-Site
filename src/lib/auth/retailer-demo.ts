const storageKey = "mobile-studio-retailer-demo-session";
const sessionChangedEvent = "mobile-studio-retailer-demo-session-changed";

export function isRetailerDemoEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function hasRetailerDemoSession() {
  if (!isRetailerDemoEnabled() || typeof window === "undefined") return false;
  return window.localStorage.getItem(storageKey) === "active";
}

export function startRetailerDemoSession() {
  if (!isRetailerDemoEnabled() || typeof window === "undefined") {
    throw new Error("Retailer demo access is only available in a development or test build.");
  }
  window.localStorage.setItem(storageKey, "active");
  window.dispatchEvent(new Event(sessionChangedEvent));
}

export function endRetailerDemoSession() {
  if (typeof window === "undefined") {
    throw new Error("Retailer demo access can only be ended in the browser.");
  }
  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(sessionChangedEvent));
}

export function subscribeToRetailerDemoSession(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(sessionChangedEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(sessionChangedEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}
