chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (tab.url.includes("youtube.com")) {
      if (changeInfo.url) {
        await chrome.tabs.sendMessage(tabId, { urlChanged: true });
      }
    }
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
