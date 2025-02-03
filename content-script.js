let CAT1 = []; // 🍁
let CAT2 = []; // 🇲🇽
let CAT3 = []; // ❌
let CAT4 = []; // ❓
let CAT5 = []; // ❔
let CAT6 = []; // 🌐

/**
 * Normalize a string by converting to uppercase, removing parenthetical content,
 * stripping trademark symbols, and then removing any non-alphanumeric characters.
 */
function superNormalize(str) {
  let out = str.toUpperCase();
  // Remove any parenthetical content (e.g., " (ITALY)" becomes "")
  out = out.replace(/\(.*?\)/g, "");
  out = out.replace(/[®™©]/g, "");
  out = out.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  out = out.replace(/[^A-Z0-9]/g, "");
  return out;
}

/**
 * Given a text string (such as a product title), check all brand lists and
 * return the emoji corresponding to the best match.
 *
 * For each category, we loop over its brands. If the normalized text contains
 * the normalized brand, we record that match along with the length of the
 * normalized brand string. In the end, we choose the match with the longest
 * normalized brand (and if there’s a tie, the one from the higher-priority
 * category).
 */
function determineEmoji(text) {
  const normalizedText = superNormalize(text);
  // Define our categories along with their indicator emoji and a priority.
  // Lower priority numbers mean “more important.”
  const categories = [
    { arr: CAT1, emoji: "🍁", priority: 1 },
    { arr: CAT2, emoji: "🇲🇽", priority: 2 },
    { arr: CAT3, emoji: "❌", priority: 3 },
    { arr: CAT4, emoji: "❓", priority: 4 },
    { arr: CAT5, emoji: "❔", priority: 5 },
    { arr: CAT6, emoji: "🌐", priority: 6 }
  ];

  let bestMatch = { emoji: "", length: 0, priority: Infinity };

  // Loop over every category and every brand in that category.
  for (const cat of categories) {
    for (const brand of cat.arr) {
      const normBrand = superNormalize(brand);
      if (normBrand && normalizedText.includes(normBrand)) {
        // If this brand's normalized length is longer than what we already have,
        // or if equal but the category has higher priority, record it.
        if (
          normBrand.length > bestMatch.length ||
          (normBrand.length === bestMatch.length && cat.priority < bestMatch.priority)
        ) {
          bestMatch = { emoji: cat.emoji, length: normBrand.length, priority: cat.priority };
        }
      }
    }
  }
  return bestMatch.emoji;
}

/**
 * Recursively gather all text from an element.
 */
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
 * Tag an element by appending the appropriate origin emoji to its inner text.
 * (Skip tagging if an indicator is already present.)
 */
function tagElement(el) {
  if (!el) return;
  const text = gatherAllText(el);
  if (!text) return;
  // If any indicator emoji is already present, skip tagging.
  if (/[❌🍁🇲🇽❓❔🌐]/.test(text)) return;

  const emoji = determineEmoji(text);
  if (emoji) {
    el.innerText += " " + emoji;
  }
}

/**
 * Scan for elements that are likely to be product titles, then tag each.
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
 * Walk through all text nodes in the document and tag them if they’re not
 * already tagged.
 */
function walkTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (true) {
    const node = walker.nextNode();
    if (!node) break;
    const txt = node.nodeValue;
    if (!txt || !txt.trim()) continue;
    // Skip if the node already contains an indicator emoji.
    if (/[❌🍁🇲🇽❓❔🌐]/.test(txt)) continue;
    const emoji = determineEmoji(txt);
    if (emoji) {
      node.nodeValue = txt + " " + emoji;
    }
  }
}

/**
 * Observe DOM mutations and re-run our scans.
 */
function observeMutations() {
  const observer = new MutationObserver(() => {
    scanBySelectors();
    walkTextNodes();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Main function: load our brand lists from storage and initiate scans.
 */
function main() {
  chrome.storage.sync.get(
    [
      "cat1Canadian",
      "cat2Mexican",
      "cat3US",
      "cat4PartialUSCA",
      "cat5PartialUSMX",
      "cat6Outside"
    ],
    (data) => {
      CAT1 = data.cat1Canadian || [];
      CAT2 = data.cat2Mexican || [];
      CAT3 = data.cat3US || [];
      CAT4 = data.cat4PartialUSCA || [];
      CAT5 = data.cat5PartialUSMX || [];
      CAT6 = data.cat6Outside || [];

      scanBySelectors();
      walkTextNodes();
      observeMutations();
    }
  );
}

main();
