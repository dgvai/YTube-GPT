const API_SERVER = "http://localhost:3000";

const template = `
<main id="ytube-gpt-main" class="main-layout">
  <div id="ytube-gpt-header" class="chatbox-header">
    <bold>YTube GPT</bold>
  </div>
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

const getVideoTranscript = async () => {
  const videoId = getVideoIdFromQuery();
  const response = await fetchResource(`${API_SERVER}/youtube/caption/${videoId}`);

  if (response.status !== 200) return false;

  const data = await response.text();
  return data;
};

const insertTemplate = () => {
  document.body.insertAdjacentHTML("afterbegin", template);
  console.log("YTube GPT is Ready in Client!");
};

const triggerLoader = (show) => {
  if (show) {
    document.getElementById("ytube-gtp-chatbox").insertAdjacentHTML("afterend", loader);
  } else {
    document.querySelector(".loader").remove();
  }
};

const disableInputField = (message) => {
  const element = document.getElementById("ytube-gpt-msg");
  element.setAttribute("disabled", true);
  element.setAttribute("placeholder", message);
};

const enableInputField = (message) => {
  const element = document.getElementById("ytube-gpt-msg");
  element.removeAttribute("disabled");
  element.setAttribute("placeholder", message);
};

let messages = [];
let windowMaximized = true;

const initMessages = (transcript) => {
  messages = [
    {
      role: "system",
      content: transcript,
    },
  ];
};

const initTranscript = async () => {
  const transcript = await getVideoTranscript();

  if (!transcript) {
    disableInputField("No transcript available!");
  } else {
    enableInputField("Type your message…");
    initMessages(transcript);
  }
};

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.urlChanged) await initTranscript();
});

async function main() {
  insertTemplate();
  const form = document.getElementById("ytube-gpt-form");
  const inputField = document.getElementById("ytube-gpt-msg");
  const header = document.getElementById("ytube-gpt-header");

  await initTranscript();
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

    if (response.status === 500) {
      disableInputField("Something went wrong!");
      triggerLoader(false);
      return;
    }
    const reply = await response.json();
    messages.push(reply);

    const botText = makeBotText(reply.content);
    insertIntoChatbox(botText);
    triggerLoader(false);
  });

  header.addEventListener("click", () => {
    const main = document.getElementById("ytube-gpt-main");
    if (windowMaximized) {
      main.classList.add("yt-gpt-minimized");
      windowMaximized = false;
    } else {
      main.classList.remove("yt-gpt-minimized");
      windowMaximized = true;
    }
  });
}

main();
