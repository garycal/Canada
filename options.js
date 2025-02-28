document.addEventListener("DOMContentLoaded", () => {
  const cat1TA = document.getElementById("cat1");
  const cat2TA = document.getElementById("cat2");
  const cat3TA = document.getElementById("cat3");
  const cat4TA = document.getElementById("cat4");
  const cat5TA = document.getElementById("cat5");
  const cat6TA = document.getElementById("cat6");
  const cat7TA = document.getElementById("cat7"); // new MAGA donor area

  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Load from storage
  chrome.storage.sync.get([
    "cat1Canadian",
    "cat2Mexican",
    "cat3US",
    "cat4PartialUSCA",
    "cat5PartialUSMX",
    "cat6Outside",
    "cat7MagaDonor"
  ], (data) => {
    if (data.cat1Canadian)    cat1TA.value = data.cat1Canadian.join("\n");
    if (data.cat2Mexican)     cat2TA.value = data.cat2Mexican.join("\n");
    if (data.cat3US)          cat3TA.value = data.cat3US.join("\n");
    if (data.cat4PartialUSCA) cat4TA.value = data.cat4PartialUSCA.join("\n");
    if (data.cat5PartialUSMX) cat5TA.value = data.cat5PartialUSMX.join("\n");
    if (data.cat6Outside)     cat6TA.value = data.cat6Outside.join("\n");
    if (data.cat7MagaDonor)   cat7TA.value = data.cat7MagaDonor.join("\n");
  });

  // on Save
  saveBtn.addEventListener("click", () => {
    const cat1List = cat1TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat2List = cat2TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat3List = cat3TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat4List = cat4TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat5List = cat5TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat6List = cat6TA.value.split("\n").map(s => s.trim()).filter(Boolean);
    const cat7List = cat7TA.value.split("\n").map(s => s.trim()).filter(Boolean);

    chrome.runtime.sendMessage(
      {
        type: "updateBrands6",
        cat1Canadian: cat1List,
        cat2Mexican: cat2List,
        cat3US: cat3List,
        cat4PartialUSCA: cat4List,
        cat5PartialUSMX: cat5List,
        cat6Outside: cat6List,
        cat7MagaDonor: cat7List
      },
      (resp) => {
        if (resp && resp.status === "ok") {
          statusDiv.textContent = "Saved successfully!";
          setTimeout(() => {
            statusDiv.textContent = "";
          }, 2000);
        }
      }
    );
  });
});
