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

const makeBotText = (text) => {
  return `
  <div class="bot-text-container">
    <div class="avatar"></div>
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    inputField.value;
    const userText = makeUserText(inputField.value);
    messages.push({
      role: "user",
      content: inputField.value,
    });
    insertIntoChatbox(userText);
    inputField.value = "";

    const response = await fetchResource(`${API_SERVER}/gpt/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const reply = await response.json();
    const botText = makeBotText(reply.content);
    messages.push(reply);
    insertIntoChatbox(botText);
  });
}

main();
