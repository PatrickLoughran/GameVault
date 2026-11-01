const BEST_KEY_PREFIX = "gv_best_";

export function bestScoreKey(title) {
  return `${BEST_KEY_PREFIX}${title}`;
}

export function toSafeBest(value) {
  const num =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof num === "number" && Number.isFinite(num) && num >= 0 ? num : 0;
}

export function getStoredBest(title) {
  try {
    const raw = window.localStorage.getItem(bestScoreKey(title));
    return raw === null ? 0 : toSafeBest(JSON.parse(raw));
  } catch {
    return 0;
  }
}
