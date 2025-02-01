// content-script.js

let US_BRANDS = [];
let CA_BRANDS = [];

/**
 * superNormalize
 * - uppercase
 * - remove (r), (tm), (c)
 * - replace curly quotes
 * - remove punctuation
 */
function superNormalize(str) {
  let out = str.toUpperCase();
  out = out.replace(/[®™©]/g, "");
  out = out.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  out = out.replace(/[^A-Z0-9]/g, "");
  return out;
}

function matchesBrand(productText, brandArray) {
  const normText = superNormalize(productText);
  // debug: console.log("Checking text:", normText, "vs brandArray size:", brandArray.length);
  for (const brand of brandArray) {
    const normBrand = superNormalize(brand);
    if (normBrand && normText.includes(normBrand)) {
      console.log("MATCH FOUND brand:", brand, "in text:", productText);
      return true;
    }
  }
  return false;
}

/**
 * gatherAllText: recursively merges child text nodes
 */
function gatherAllText(el) {
  if (!el) return "";
  let txt = "";
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      txt += child.nodeValue;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      txt += gatherAllText(child);
    }
  });
  return txt;
}

/**
 * tagElement
 */
function tagElement(el) {
  const entireText = gatherAllText(el);
  if (!entireText) return;
  if (entireText.includes("❌") || entireText.includes("🍁")) return;

  if (matchesBrand(entireText, US_BRANDS)) {
    el.innerText = el.innerText + " ❌";
  } else if (matchesBrand(entireText, CA_BRANDS)) {
    el.innerText = el.innerText + " 🍁";
  }
}

/**
 * scanBySelectors
 */
function scanBySelectors() {
  const selectors = [
    '[data-test="item-name"]',
    '[data-testid="item-detail-name"]',
    '[data-testid="item-name"]',
    '.item-title',
    '.item-name',
    '.css-1kiw93k',
    '.css-1nhiovu'
  ];
  const combined = selectors.join(",");
  const elems = document.querySelectorAll(combined);
  console.log("scanBySelectors found:", elems.length);
  elems.forEach(tagElement);
}

/**
 * walkAndReplaceTextNodes
 */
function walkAndReplaceTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let replaced = 0;
  while (true) {
    const node = walker.nextNode();
    if (!node) break;
    const txt = node.nodeValue;
    if (!txt || !txt.trim()) continue;

    if (!txt.includes("❌") && !txt.includes("🍁")) {
      if (matchesBrand(txt, US_BRANDS)) {
        node.nodeValue = txt + " ❌";
        replaced++;
      } else if (matchesBrand(txt, CA_BRANDS)) {
        node.nodeValue = txt + " 🍁";
        replaced++;
      }
    }
  }
  console.log("TreeWalker replaced:", replaced);
}

/**
 * Insert a debug indicator
 */
function insertLoadedIndicator() {
  const div = document.createElement("div");
  div.textContent = "Instacart Extension LOADED (debug) ✅";
  div.style.cssText = `
    position: fixed;
    bottom: 10px; right: 10px;
    background: #cfc;
    border: 2px solid green;
    padding: 6px;
    z-index: 999999;
  `;
  document.body.appendChild(div);
}

/**
 * observeMutations
 */
function observeMutations() {
  const obs = new MutationObserver(() => {
    scanBySelectors();
    walkAndReplaceTextNodes();
  });
  obs.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver active");
}

/**
 * main
 */
function main() {
  console.log("content-script.js starting up");
 // insertLoadedIndicator();

  chrome.storage.sync.get(["usBrands", "caBrands"], (data) => {
    US_BRANDS = data.usBrands || [];
    CA_BRANDS = data.caBrands || [];
    console.log("Loaded brand arrays. US:", US_BRANDS.length, "CA:", CA_BRANDS.length);
    console.log("US_BRANDS:", JSON.stringify(US_BRANDS, null, 2));
    console.log("CA_BRANDS:", JSON.stringify(CA_BRANDS, null, 2));

    scanBySelectors();
    walkAndReplaceTextNodes();
    observeMutations();
  });
}

main();
