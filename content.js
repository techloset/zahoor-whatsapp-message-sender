chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "sendMessages") {
    const { messages, contactColumn } = request;
    const rows = document.querySelectorAll("tr");

    messages.forEach((message, index) => {
      const contact = rows[index + 1]
        .querySelector(`td:nth-child(${parseInt(contactColumn) + 1})`)
        .innerText.trim();
      sendMessage(contact, message);
    });
  }
});

function sendMessage(contact, message) {
  const inputSelector = "div[contenteditable='true']";
  const messageBox = document.querySelector(inputSelector);

  if (messageBox) {
    messageBox.textContent = message;
    messageBox.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      document.querySelector('span[data-icon="send"]').click();
    }, 500);
  } else {
    alert(
      "Cannot find the message box. Make sure you are on a WhatsApp chat page."
    );
  }
}
