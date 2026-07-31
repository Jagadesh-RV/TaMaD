export function setLandingScroll(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('landing-scroll', enabled);
}

export function enableLandingScroll() {
  setLandingScroll(true);
}

export function disableLandingScroll() {
  setLandingScroll(false);
}
