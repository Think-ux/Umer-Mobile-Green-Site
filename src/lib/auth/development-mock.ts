export type DevelopmentMockAccount = {
  email: string;
  fullName: string;
};

const storageKey = "mobile-studio-development-account";
const accountChangedEvent = "mobile-studio-development-account-changed";

export function isDevelopmentAuthMockEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function getDevelopmentMockAccount(): DevelopmentMockAccount | null {
  if (typeof window === "undefined") return null;

  const storedAccount = window.localStorage.getItem(storageKey);
  if (!storedAccount) return null;

  let account: unknown;
  try {
    account = JSON.parse(storedAccount);
  } catch {
    throw new Error("The saved development account is invalid. Clear this site's local storage and try again.");
  }

  if (
    typeof account !== "object" ||
    account === null ||
    !("email" in account) ||
    typeof account.email !== "string" ||
    !("fullName" in account) ||
    typeof account.fullName !== "string"
  ) {
    throw new Error("The saved development account is invalid. Clear this site's local storage and try again.");
  }

  return { email: account.email, fullName: account.fullName };
}

export function saveDevelopmentMockAccount(account: DevelopmentMockAccount) {
  if (typeof window === "undefined") {
    throw new Error("Development account storage is only available in the browser.");
  }

  window.localStorage.setItem(storageKey, JSON.stringify(account));
  window.dispatchEvent(new Event(accountChangedEvent));
}

export function clearDevelopmentMockAccount() {
  if (typeof window === "undefined") {
    throw new Error("Development account storage is only available in the browser.");
  }

  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(accountChangedEvent));
}

export function subscribeToDevelopmentMockAccount(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(accountChangedEvent, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(accountChangedEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}
