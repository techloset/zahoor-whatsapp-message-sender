import Papa from "papaparse";

document.getElementById("sendMessage").addEventListener("click", async () => {
  const csvFile = document.getElementById("csvFile").files[0];
  const messageTemplate = document.getElementById("messageTemplate").value;

  if (!csvFile || !messageTemplate) {
    alert("Please select a CSV file and enter a message template.");
    return;
  }

  const csvData = await parseCSV(csvFile);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(
      tabId,
      { action: "sendMessages", csvData, messageTemplate },
      (response) => {
        console.log(response.status);
      }
    );
  });
});

async function parseCSV(csvFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const csvText = reader.result;
      const csvData = Papa.parse(csvText, { header: true }).data;
      resolve(csvData);
    };
    reader.onerror = reject;
    reader.readAsText(csvFile);
  });
}
