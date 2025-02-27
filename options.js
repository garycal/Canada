document.addEventListener("DOMContentLoaded", () => {
  // Grab DOM references
  const cat1TA = document.getElementById("cat1");
  const cat2TA = document.getElementById("cat2");
  const cat3TA = document.getElementById("cat3");
  const cat4TA = document.getElementById("cat4");
  const cat5TA = document.getElementById("cat5");
  const cat6TA = document.getElementById("cat6");
  const debugCheckbox = document.getElementById("debugCheckbox");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Load current brand arrays + advancedBrandDebug from storage
  chrome.storage.sync.get([
    "cat1Canadian",
    "cat2Mexican",
    "cat3US",
    "cat4PartialUSCA",
    "cat5PartialUSMX",
    "cat6Outside",
    "advancedBrandDebug"
  ], (data) => {
    // Populate textareas
    if (data.cat1Canadian) cat1TA.value = data.cat1Canadian.join("\n");
    if (data.cat2Mexican) cat2TA.value = data.cat2Mexican.join("\n");
    if (data.cat3US)      cat3TA.value = data.cat3US.join("\n");
    if (data.cat4PartialUSCA) cat4TA.value = data.cat4PartialUSCA.join("\n");
    if (data.cat5PartialUSMX) cat5TA.value = data.cat5PartialUSMX.join("\n");
    if (data.cat6Outside) cat6TA.value = data.cat6Outside.join("\n");

    // Populate checkbox
    debugCheckbox.checked = !!data.advancedBrandDebug;
  });

  // On Save, parse lines back into arrays and store everything
  saveBtn.addEventListener("click", () => {
    const cat1List = cat1TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cat2List = cat2TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cat3List = cat3TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cat4List = cat4TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cat5List = cat5TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cat6List = cat6TA.value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const debugOn = debugCheckbox.checked;

    // store them in sync
    chrome.storage.sync.set({
      cat1Canadian: cat1List,
      cat2Mexican: cat2List,
      cat3US: cat3List,
      cat4PartialUSCA: cat4List,
      cat5PartialUSMX: cat5List,
      cat6Outside: cat6List,
      advancedBrandDebug: debugOn
    }, () => {
      statusDiv.textContent = "Saved successfully!";
      setTimeout(() => {
        statusDiv.textContent = "";
      }, 2000);
    });
  });
});
