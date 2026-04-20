let deferredPrompt = null;

export function initInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export async function showInstallPrompt() {
  if (!deferredPrompt) return { shown: false };
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return { shown: true, outcome: choice?.outcome };
}
