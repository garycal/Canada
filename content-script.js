/****************************************************
 * content-script.js
 ****************************************************/

let CAT1 = []; // 🍁
let CAT2 = []; // 🇲🇽
let CAT3 = []; // ❌
let CAT4 = []; // ❓
let CAT5 = []; // ❔
let CAT6 = []; // 🌐
let CAT7 = []; // MAGA Donor (🤡), new

/**
 * superNormalize: uppercase, remove parentheses, trademark symbols,
 * curly quotes, punctuation, etc.
 */
function superNormalize(str) {
  let out = str.toUpperCase();
  out = out.replace(/\(.*?\)/g, "");
  out = out.replace(/[®™©]/g, "");
  out = out.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  out = out.replace(/[^A-Z0-9]/g, "");
  return out;
}

/** 
 * foundMagaDonor checks if text includes any brand from cat7 (≥4 chars).
 */
function foundMagaDonor(text) {
  const normText = superNormalize(text);
  for (const brand of CAT7) {
    const nb = superNormalize(brand);
    if (nb.length < 4) continue;
    if (nb && normText.includes(nb)) {
      return true;
    }
  }
  return false;
}

/**
 * findBestBrandAndEmoji
 *  Return { brand, emoji } from the best match in cat1..cat6, ignoring
 *  brand length <4. Ties break by smaller "priority".
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
      if (nb.length < 4) continue;
      if (nb && normalizedText.includes(nb)) {
        // If brand is longer or tie but lower priority => store
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
  } else {
    return null;
  }
}

/** 
 * gatherAllText from an element 
 */
function gatherAllText(elem) {
  if (!elem) return "";
  let txt = "";
  elem.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      txt += child.nodeValue;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      txt += gatherAllText(child);
    }
  });
  return txt;
}

/**
 * tagElement logic:
 * - skip if text already includes any known indicator
 * - if MAGA brand => prepend "🤡 MAGA Donor 🤬"
 * - then find best brand => append that emoji
 */
function tagElement(el) {
  if (!el) return;
  const originalText = gatherAllText(el);
  if (!originalText) return;

  // If already has an indicator, skip
  if (/(❌|🍁|🇲🇽|❓|❔|🌐|MAGA Donor)/.test(originalText)) {
    return;
  }

  let newText = originalText;

  // A) if in MAGA cat7 => prepend
  if (foundMagaDonor(originalText)) {
    newText = "🤡 MAGA Donor 🤬" + newText;
  }

  // B) see if cat1..cat6 matched => append
  const catResult = findBestBrandAndEmoji(originalText);
  if (catResult) {
    newText += " " + catResult.emoji;
  }

  el.innerText = newText;
}

/**
 * scanBySelectors: attempt known product-title selectors
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
 * walkTextNodes: do the same logic for raw text nodes
 */
function walkTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (true) {
    const node = walker.nextNode();
    if (!node) break;
    let txt = node.nodeValue;
    if (!txt || !txt.trim()) continue;
    // skip if it has an indicator
    if (/(❌|🍁|🇲🇽|❓|❔|🌐|MAGA Donor)/.test(txt)) continue;

    if (foundMagaDonor(txt)) {
      txt = "🤡 MAGA Donor 🤬" + txt;
    }

    const catResult = findBestBrandAndEmoji(txt);
    if (catResult) {
      txt += " " + catResult.emoji;
    }

    node.nodeValue = txt;
  }
}

/**
 * observeMutations
 */
function observeMutations() {
  const obs = new MutationObserver(() => {
    scanBySelectors();
    walkTextNodes();
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/**
 * main
 */
function main() {
  chrome.storage.sync.get([
    "cat1Canadian", 
    "cat2Mexican", 
    "cat3US",
    "cat4PartialUSCA",
    "cat5PartialUSMX",
    "cat6Outside",
    "cat7MagaDonor"
  ], (data) => {
    CAT1 = data.cat1Canadian || [];
    CAT2 = data.cat2Mexican || [];
    CAT3 = data.cat3US || [];
    CAT4 = data.cat4PartialUSCA || [];
    CAT5 = data.cat5PartialUSMX || [];
    CAT6 = data.cat6Outside || [];
    CAT7 = data.cat7MagaDonor || [];

    scanBySelectors();
    walkTextNodes();
    observeMutations();
  });
}

main();
