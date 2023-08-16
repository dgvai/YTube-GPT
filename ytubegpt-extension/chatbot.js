const API_SERVER = "http://localhost:3000";

const template = `
<main class="flex flex-col items-center justify-center h-96 bg-gray-100 text-gray-800">
  <div class="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
    <div id="ytube-gtp-chatbox" class="flex flex-col flex-grow h-0 p-4 overflow-auto">

    </div>

    <div class="bg-gray-300 p-4">
      <form id="ytube-gpt-form">
      <input id="ytube-gpt-msg" class="flex items-center h-10 w-full rounded px-3 text-sm" type="text" placeholder="Type your message…" />
      </form>
    </div>
  </div>
</main>
`;

const makeBotText = (text) => {
  return `
  <div class="flex w-full mt-2 space-x-3 max-w-xs">
    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
    <div>
      <div class="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
        <p class="text-sm">${text}</p>
      </div>
      <span class="text-xs text-gray-500 leading-none">2 min ago</span>
    </div>
  </div>
  `;
};

const makeUserText = (text) => {
  return `
  <div class="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
    <div>
      <div class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
        <p class="text-sm">${text}</p>
      </div>
      <span class="text-xs text-gray-500 leading-none">2 min ago</span>
    </div>
    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
  </div>
  `;
};

const getVideoIdFromQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
};

const fetchResource = (input, init) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ input, init }, (messageResponse) => {
      const [response, error] = messageResponse;
      if (response === null) {
        reject(error);
      } else {
        const body = response.body ? new Blob([response.body]) : undefined;
        resolve(
          new Response(body, {
            status: response.status,
            statusText: response.statusText,
          })
        );
      }
    });
  });
};

const scrollToBottom = () => {
  const chatbox = document.getElementById("ytube-gtp-chatbox");
  chatbox.scrollTop = chatbox.scrollHeight;
};

const insertIntoChatbox = (element) => {
  const chatbox = document.getElementById("ytube-gtp-chatbox");
  chatbox.insertAdjacentHTML("beforeend", element);
  scrollToBottom();
};

const getVideoTranscript = async (videoId) => {
  const response = await fetchResource(`${API_SERVER}/youtube/caption/${videoId}`);
  const data = await response.text();
  return data;
};

const insertTemplate = () => {
  document.getElementById("secondary").insertAdjacentHTML("afterbegin", template);
};

async function main() {
  const videoId = getVideoIdFromQuery();
  const transcript = await getVideoTranscript(videoId);

  insertTemplate();
  const form = document.getElementById("ytube-gpt-form");
  const inputField = document.getElementById("ytube-gpt-msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    inputField.value;
    const userText = makeUserText(inputField.value);
    insertIntoChatbox(userText);
    inputField.value = "";
  });
}

main();
