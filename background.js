chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openWhatsAppTab") {
    chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        // If WhatsApp Web is already open, use the existing tab
        chrome.tabs.update(tabs[0].id, { active: true }, (tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: "sendMessage",
            message: request.message,
          });
          sendResponse({ status: "success" });
        });
      } else {
        // Otherwise, open a new tab with WhatsApp Web
        chrome.tabs.create({ url: "https://web.whatsapp.com/" }, (tab) => {
          // Wait for the tab to load, then send the message
          chrome.tabs.onUpdated.addListener(function listener(
            tabId,
            changeInfo
          ) {
            if (tabId === tab.id && changeInfo.status === "complete") {
              chrome.tabs.sendMessage(tab.id, {
                action: "sendMessage",
                message: request.message,
              });
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
          sendResponse({ status: "success" });
        });
      }
    });
    return true; // Will respond asynchronously
  }
});
