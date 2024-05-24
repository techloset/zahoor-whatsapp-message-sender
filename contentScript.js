async function sendMessages(csvData, messageTemplate) {
  for (const row of csvData) {
    const employeeName = row.employee_name;
    const employeeMessage = messageTemplate
      .replace(/<<employee_name>>/g, employeeName)
      .replace(/<<employee_message>>/g, row.employee_message);
    await sendMessageOnWhatsApp(row.phone_number, employeeMessage);
  }
}

async function sendMessageOnWhatsApp(phoneNumber, message) {
  // Open a new chat with the phone number
  const chatUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
  window.open(chatUrl, "_blank");

  // Wait for the WhatsApp Web interface to load
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Get the chat input field
  const chatInput = document.querySelector(
    '[contenteditable="true"][data-tab="6"]'
  );
  if (!chatInput) {
    console.error("Chat input field not found.");
    return;
  }

  // Focus on the chat input field
  chatInput.focus();

  // Insert the message text
  document.execCommand("insertText", false, message);

  // Simulate pressing the Enter key to send the message
  chatInput.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
    })
  );

  // Wait a bit before closing the chat window
  await new Promise((resolve) => setTimeout(resolve, 3000));
  window.close();
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendMessages") {
    sendMessages(request.csvData, request.messageTemplate).then(() => {
      sendResponse({ status: "Messages sent" });
    });
    return true; // Keep the messaging channel open for sendResponse
  }
});
