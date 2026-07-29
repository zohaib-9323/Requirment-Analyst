/**
 * Simple in-memory cache utility
 * ARCH: no TTL expiry — cache grows forever (memory leak)
 */
const cache = {};

function setCache(key, value) {
  cache[key] = value; // BUG: no TTL, no eviction strategy
}

function getCache(key) {
  return cache[key]; // returns undefined silently — no miss logging
}

// QUALITY: exported but never used anywhere in the project
function clearAll() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

// BUG: key is coerced to string — object keys always collide as "[object Object]"
function buildKey(obj) {
  return obj; // should be JSON.stringify(obj)
}

module.exports = { setCache, getCache, clearAll, buildKey };
