// content-script.js

let CAT1 = []; // 🍁
let CAT2 = []; // 🇲🇽
let CAT3 = []; // ❌
let CAT4 = []; // ❓
let CAT5 = []; // ❔
let CAT6 = []; // 🌐

function superNormalize(str) {
  let out = str.toUpperCase();
  out = out.replace(/[®™©]/g, "");
  out = out.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  out = out.replace(/[^A-Z0-9]/g, "");
  return out;
}

function matchBrand(text, brandArr) {
  const norm = superNormalize(text);
  for (const brand of brandArr) {
    const nb = superNormalize(brand);
    if (nb && norm.includes(nb)) {
      return true;
    }
  }
  return false;
}

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

function tagElement(el) {
  const text = gatherAllText(el);
  if (!text) return;
  if (/[❌🍁🇲🇽❓❔🌐]/.test(text)) return; // skip if we already appended

  // in priority order
  if (matchBrand(text, CAT1)) {
    el.innerText += " 🍁";
  } else if (matchBrand(text, CAT2)) {
    el.innerText += " 🇲🇽";
  } else if (matchBrand(text, CAT3)) {
    el.innerText += " ❌";
  } else if (matchBrand(text, CAT4)) {
    el.innerText += " ❓";
  } else if (matchBrand(text, CAT5)) {
    el.innerText += " ❔";
  } else if (matchBrand(text, CAT6)) {
    el.innerText += " 🌐";
  }
}

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

function walkTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (true) {
    const node = walker.nextNode();
    if (!node) break;
    const txt = node.nodeValue;
    if (!txt || !txt.trim()) continue;

    if (!/[❌🍁🇲🇽❓❔🌐]/.test(txt)) {
      if (matchBrand(txt, CAT1)) {
        node.nodeValue = txt + " 🍁";
      } else if (matchBrand(txt, CAT2)) {
        node.nodeValue = txt + " 🇲🇽";
      } else if (matchBrand(txt, CAT3)) {
        node.nodeValue = txt + " ❌";
      } else if (matchBrand(txt, CAT4)) {
        node.nodeValue = txt + " ❓";
      } else if (matchBrand(txt, CAT5)) {
        node.nodeValue = txt + " ❔";
      } else if (matchBrand(txt, CAT6)) {
        node.nodeValue = txt + " 🌐";
      }
    }
  }
}

function observeMutations() {
  const obs = new MutationObserver(() => {
    scanBySelectors();
    walkTextNodes();
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function main() {
  chrome.storage.sync.get([
    "cat1Canadian",
    "cat2Mexican",
    "cat3US",
    "cat4PartialUSCA",
    "cat5PartialUSMX",
    "cat6Outside"
  ], (data) => {
    CAT1 = data.cat1Canadian || [];
    CAT2 = data.cat2Mexican || [];
    CAT3 = data.cat3US || [];
    CAT4 = data.cat4PartialUSCA || [];
    CAT5 = data.cat5PartialUSMX || [];
    CAT6 = data.cat6Outside || [];

    scanBySelectors();
    walkTextNodes();
    observeMutations();
  });
}

main();
