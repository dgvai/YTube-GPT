chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener(function (tab) {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        files: ["chatbot.js"],
      })
      .then(() => console.log("YTube GPT is Ready!"));
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
});
