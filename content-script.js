/****************************************************
 * content-script.js
 ****************************************************/

let CAT1 = []; // 🍁
let CAT2 = []; // 🇲🇽
let CAT3 = []; // ❌
let CAT4 = []; // ❓
let CAT5 = []; // ❔
let CAT6 = []; // 🌐

let advancedMode = false; // toggled by "advancedBrandDebug"

function superNormalize(str) {
  let out = str.toUpperCase();
  // remove parentheses
  out = out.replace(/\(.*?\)/g, "");
  // remove trademark symbols
  out = out.replace(/[®™©]/g, "");
  // replace curly quotes
  out = out.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  // keep only letters/digits
  out = out.replace(/[^A-Z0-9]/g, "");
  return out;
}

/**
 * Return { brand, emoji } or null
 * skipping brand if normalized length <4
 */
function findBestBrandAndEmoji(originalText) {
  const normalizedText = superNormalize(originalText);
  let best = { brand: "", length: 0, priority: Infinity, emoji: "" };

  const categories = [
    { arr: CAT1, emoji: "🍁", priority: 1 },
    { arr: CAT2, emoji: "🇲🇽", priority: 2 },
    { arr: CAT3, emoji: "❌", priority: 3 },
    { arr: CAT4, emoji: "❓", priority: 4 },
    { arr: CAT5, emoji: "❔", priority: 5 },
    { arr: CAT6, emoji: "🌐", priority: 6 }
  ];

  for (const cat of categories) {
    for (const brand of cat.arr) {
      const nb = superNormalize(brand);
      // skip brand if length <4
      if (nb.length < 4) continue;

      if (nb && normalizedText.includes(nb)) {
        if (
          nb.length > best.length ||
          (nb.length === best.length && cat.priority < best.priority)
        ) {
          best = {
            brand,
            length: nb.length,
            priority: cat.priority,
            emoji: cat.emoji
          };
        }
      }
    }
  }

  if (best.emoji) {
    return { brand: best.brand, emoji: best.emoji };
  }
  return null;
}

/** Recursively gather text from an element. */
function gatherAllText(elem) {
  if (!elem) return "";
  let txt = "";
  elem.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      txt += child.nodeValue;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      txt += gatherAllText(child);
    }
  });
  return txt;
}

/**
 * If we haven't appended an emoji yet, check for brand & append
 */
function tagElement(el) {
  if (!el) return;
  const text = gatherAllText(el);
  if (!text) return;

  // skip if there's already an emoji
  if (/[❌🍁🇲🇽❓❔🌐]/.test(text)) return;

  const result = findBestBrandAndEmoji(text);
  if (result) {
    if (advancedMode) {
      // e.g. " 🍁 [Lay's]"
      el.innerText += ` ${result.emoji} [${result.brand}]`;
    } else {
      el.innerText += " " + result.emoji;
    }
  }
}

/**
 * Query likely product-title selectors
 */
function scanBySelectors() {
  const selectors = [
    '[data-test="item-name"]',
    '[data-testid="item-detail-name"]',
    '[data-testid="item-name"]',
    '.item-title',
    '.product-title',
    '.product-name',
    '.item-name',
    '.sku-title',
    '.css-1nhiovu',
    '.css-1kiw93k',
    '.product-header',
    '.s-title'
  ];
  const combined = selectors.join(",");
  const elems = document.querySelectorAll(combined);
  elems.forEach(tagElement);
}

/**
 * Walk text nodes, append the same logic if brand found
 */
function walkTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (true) {
    const node = walker.nextNode();
    if (!node) break;
    const txt = node.nodeValue;
    if (!txt || !txt.trim()) continue;
    if (/[❌🍁🇲🇽❓❔🌐]/.test(txt)) continue;

    const result = findBestBrandAndEmoji(txt);
    if (result) {
      if (advancedMode) {
        node.nodeValue = txt + ` ${result.emoji} [${result.brand}]`;
      } else {
        node.nodeValue = txt + " " + result.emoji;
      }
    }
  }
}

/** Observe DOM changes to keep re-tagging. */
function observeMutations() {
  const observer = new MutationObserver(() => {
    scanBySelectors();
    walkTextNodes();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/** main */
function main() {
  // load brand arrays + advancedBrandDebug from storage
  chrome.storage.sync.get([
    "cat1Canadian", "cat2Mexican", "cat3US",
    "cat4PartialUSCA", "cat5PartialUSMX", "cat6Outside",
    "advancedBrandDebug"
  ], (data) => {
    CAT1 = data.cat1Canadian || [];
    CAT2 = data.cat2Mexican || [];
    CAT3 = data.cat3US || [];
    CAT4 = data.cat4PartialUSCA || [];
    CAT5 = data.cat5PartialUSMX || [];
    CAT6 = data.cat6Outside || [];

    // read advancedBrandDebug => toggles advancedMode
    advancedMode = !!data.advancedBrandDebug;

    // do initial
    scanBySelectors();
    walkTextNodes();
    observeMutations();
  });
}

main();
