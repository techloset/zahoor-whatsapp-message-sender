document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("csvInput")
    .addEventListener("change", handleFileSelect);
  document
    .getElementById("startProcess")
    .addEventListener("click", startProcess);
  document
    .getElementById("sendMessages")
    .addEventListener("click", sendMessages);
  document
    .getElementById("openWhatsAppWeb")
    .addEventListener("click", function () {
      chrome.tabs.create({ url: "https://web.whatsapp.com" });
    });
});

function handleFileSelect(event) {
  const file = event.target.files[0];
  const dropdownMenu = document.getElementById("columnDropdown");
  const contactColumnSelection = document.getElementById(
    "contactColumnSelection"
  );

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const csvData = e.target.result;
      const parsedData = parseCSV(csvData);
      const columnNames = parsedData[0]; // Assuming first row contains column names
      populateDropdown(columnNames);
      populateContactDropdown(columnNames);
      dropdownMenu.style.display = "block"; // Show the dropdown menu
      contactColumnSelection.style.display = "block"; // Show the contact column selection
    };
    reader.readAsText(file);
  } else {
    dropdownMenu.style.display = "none"; // Hide the dropdown menu if no file selected
    contactColumnSelection.style.display = "none"; // Hide the contact column selection
  }
}

function populateDropdown(columnNames) {
  const dropdownMenu = document.getElementById("columnDropdown");
  dropdownMenu.innerHTML = "";
  columnNames.forEach((columnName) => {
    const option = document.createElement("option");
    option.textContent = columnName;
    option.value = columnName; // Set the value of the option to the column name
    dropdownMenu.appendChild(option);
  });

  // Add event listener to dropdown menu
  dropdownMenu.addEventListener("change", function () {
    const selectedColumnName = this.value;
    const inputMessage = document.getElementById("textInput").value;
    const placeholder = `{{${selectedColumnName}}}`;
    document.getElementById("textInput").value = inputMessage + placeholder;
  });
}

function populateContactDropdown(columnNames) {
  const contactColumnDropdown = document.getElementById("contactColumnOptions");
  contactColumnDropdown.innerHTML = "";
  columnNames.forEach((columnName) => {
    const option = document.createElement("option");
    option.textContent = columnName;
    option.value = columnName; // Set the value of the option to the column name
    contactColumnDropdown.appendChild(option);
  });
}

function startProcess() {
  const fileInput = document.getElementById("csvInput");
  const inputMessage = document.getElementById("textInput").value;

  if (!fileInput.files[0]) {
    alert("Please select a CSV file.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const csvData = e.target.result;
    const parsedData = parseCSV(csvData);
    const columnNames = parsedData[0];
    const mappedResults = mapPlaceholders(
      inputMessage,
      columnNames,
      parsedData
    );
    displayResults(mappedResults);
  };

  reader.readAsText(file);
}

function parseCSV(csvData) {
  const rows = csvData
    .trim()
    .split("\n")
    .map((row) => row.split(","));
  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

function mapPlaceholders(inputMessage, columnNames, csvData) {
  const mappedResults = [];
  const rows = csvData.slice(1); // Exclude header row

  rows.forEach((row) => {
    let mappedMessage = inputMessage;
    columnNames.forEach((columnName, index) => {
      const placeholder = `{{${columnName}}}`;
      mappedMessage = mappedMessage.replace(
        new RegExp(escapeRegExp(placeholder), "g"),
        row[index]
      );
    });
    mappedResults.push(mappedMessage);
  });
  return mappedResults;
}

function displayResults(mappedResults) {
  const mappedResultsDiv = document.getElementById("mappedResults");
  mappedResultsDiv.innerHTML = "";
  mappedResults.forEach((result) => {
    const p = document.createElement("p");
    p.textContent = result;
    mappedResultsDiv.appendChild(p);
  });
}

function sendMessages() {
  chrome.storage.local.get(["mappedResults", "contactColumn"], function (data) {
    const { mappedResults, contactColumn } = data;

    if (!mappedResults || !contactColumn) {
      alert("No results to send or contact column not selected.");
      return;
    }

    mappedResults.forEach((message, index) => {
      const contactNumber = contactColumn[index];
      if (contactNumber) {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${contactNumber}&text=${encodedMessage}`;
        chrome.tabs.create({ url: whatsappUrl });
      }
    });
  });
}

// Function to escape regular expression special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
