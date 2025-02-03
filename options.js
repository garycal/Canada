// options.js

document.addEventListener("DOMContentLoaded", () => {
  const cat1El = document.getElementById("cat1");
  const cat2El = document.getElementById("cat2");
  const cat3El = document.getElementById("cat3");
  const cat4El = document.getElementById("cat4");
  const cat5El = document.getElementById("cat5");
  const cat6El = document.getElementById("cat6");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

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
      if (data.cat1Canadian) cat1El.value = data.cat1Canadian.join("\n");
      if (data.cat2Mexican) cat2El.value = data.cat2Mexican.join("\n");
      if (data.cat3US) cat3El.value = data.cat3US.join("\n");
      if (data.cat4PartialUSCA) cat4El.value = data.cat4PartialUSCA.join("\n");
      if (data.cat5PartialUSMX) cat5El.value = data.cat5PartialUSMX.join("\n");
      if (data.cat6Outside) cat6El.value = data.cat6Outside.join("\n");
    }
  );

  saveBtn.addEventListener("click", () => {
    const cat1 = cat1El.value.split("\n").map(s => s.trim()).filter(s => s);
    const cat2 = cat2El.value.split("\n").map(s => s.trim()).filter(s => s);
    const cat3 = cat3El.value.split("\n").map(s => s.trim()).filter(s => s);
    const cat4 = cat4El.value.split("\n").map(s => s.trim()).filter(s => s);
    const cat5 = cat5El.value.split("\n").map(s => s.trim()).filter(s => s);
    const cat6 = cat6El.value.split("\n").map(s => s.trim()).filter(s => s);

    chrome.runtime.sendMessage({
      type: "updateBrands6",
      cat1Canadian: cat1,
      cat2Mexican: cat2,
      cat3US: cat3,
      cat4PartialUSCA: cat4,
      cat5PartialUSMX: cat5,
      cat6Outside: cat6
    }, (resp) => {
      if (resp && resp.status === "ok") {
        statusDiv.textContent = "Saved!";
        setTimeout(() => { statusDiv.textContent = ""; }, 2000);
      }
    });
  });
});
