const API_SERVER = "http://localhost:3000";

const template = `
<main class="main-layout">
  <div class="chatbox-container">
    <div id="ytube-gtp-chatbox" class="messages-container"></div>
    <div class="input-container">
      <form id="ytube-gpt-form" class="form-container">
        <input id="ytube-gpt-msg" class="user-input" type="text" placeholder="Type your message…" />
      </form>
    </div>
  </div>
</main>
`;

const loader = `<div class="loader"><span></span><span></span><span></span></div>`;

const makeBotText = (text) => {
  return `
  <div class="bot-text-container">
    <img src="https://i.ibb.co/njCNCh7/DON-1.png" class="avatar"/>
    <div>
      <div class="bot-text-bg">
        <p class="chat-text">${text}</p>
      </div>
    </div>
  </div>
  `;
};

const makeUserText = (text) => {
  return `
  <div class="user-text-container">
    <div>
      <div class="user-text-bg">
        <p class="chat-text">${text}</p>
      </div>
    </div>
    <div class="avatar"></div>
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

const triggerLoader = (show) => {
  if (show) {
    document.getElementById("ytube-gtp-chatbox").insertAdjacentHTML("afterend", loader);
  } else {
    document.querySelector(".loader").remove();
  }
};

async function main() {
  const videoId = getVideoIdFromQuery();
  const transcript = await getVideoTranscript(videoId);
  const messages = [
    {
      role: "system",
      content: transcript,
    },
  ];

  insertTemplate();
  const form = document.getElementById("ytube-gpt-form");
  const inputField = document.getElementById("ytube-gpt-msg");
  inputField.focus();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const trimmedInput = inputField.value.trim();
    if (trimmedInput === "") return;

    messages.push({
      role: "user",
      content: trimmedInput,
    });

    const userText = makeUserText(trimmedInput);
    insertIntoChatbox(userText);

    inputField.value = "";

    triggerLoader(true);
    const response = await fetchResource(`${API_SERVER}/gpt/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const reply = await response.json();
    messages.push(reply);

    const botText = makeBotText(reply.content);
    insertIntoChatbox(botText);
    triggerLoader(false);
  });
}

main();
