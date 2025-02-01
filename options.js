// options.js

document.addEventListener("DOMContentLoaded", () => {
  const usTextarea = document.getElementById("usBrands");
  const caTextarea = document.getElementById("caBrands");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Load current brand arrays from storage
  chrome.storage.sync.get(["usBrands", "caBrands"], (data) => {
    if (data.usBrands) {
      usTextarea.value = data.usBrands.join("\n");
    }
    if (data.caBrands) {
      caTextarea.value = data.caBrands.join("\n");
    }
  });

  // On Save, parse lines back into arrays
  saveBtn.addEventListener("click", () => {
    const usBrands = usTextarea.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const caBrands = caTextarea.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    chrome.runtime.sendMessage({ type: "updateBrands", usBrands, caBrands }, (resp) => {
      if (resp && resp.status === "ok") {
        statusDiv.textContent = "Saved successfully!";
        setTimeout(() => (statusDiv.textContent = ""), 2000);
      }
    });
  });
});
