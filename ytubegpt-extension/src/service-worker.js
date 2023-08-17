chrome.runtime.onInstalled.addListener(function () {
  let currentTabId;
  chrome.action.onClicked.addListener(function (tab) {
    currentTabId = tab.id;
    chrome.scripting
      .executeScript({
        target: { tabId: currentTabId },
        files: ["src/chatbot.js"],
      })
      .then(() => console.log("YTube GPT is Ready!"));

    chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
      if (tabId === currentTabId) {
        if (changeInfo.url) {
          await chrome.tabs.sendMessage(currentTabId, { urlChanged: true });
        }
      }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.input) {
    fetch(request.input, request.init).then(
      (response) => {
        return response.text().then((text) => {
          sendResponse([
            {
              body: text,
              status: response.status,
              statusText: response.statusText,
            },
            null,
          ]);
        });
      },
      (error) => {
        sendResponse([null, error]);
      }
    );
    return true;
  }
});
