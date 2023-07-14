var socket = io();
var form = document.getElementById("form");
var input = document.getElementById("input");
const userId = document.getElementById("userId").value;
const chatId = document.getElementById("chatId").value;
const friendId = document.getElementById("friendId").value;
const messages = document.getElementById("messages");

messages.scrollTo(0, messages.scrollHeight);

socket.emit("register", userId);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    var item = document.createElement("li");
    item.textContent = input.value;
    // item.style.textAlign = "right";
    item.classList.add("me");
    messages.appendChild(item);
    // window.scrollTo(0, document.body.scrollHeight);
    messages.scrollTo(0, messages.scrollHeight);
    socket.emit("chat message", {
      pm: input.value,
      chatId: chatId,
      friendId: friendId,
      userId: userId,
    });
    input.value = "";
  }
});

socket.on("chat message", function (content) {
  if (content.userId === friendId) {
    var item = document.createElement("li");
    item.textContent = content.pm;
    item.classList.add("he-she");
    messages.appendChild(item);
    // window.scrollTo(0, document.body.scrollHeight);
    messages.scrollTo(0, messages.scrollHeight);
  } else {
    alert(`شما پیام دارید  :  ${content.pm.substring(0, 30)} ...`);
  }
});

function submitForm(li) {
  const form = li.querySelector("form");
  form.submit();
}

function sendData(element) {
  const results = document.getElementById("searchResult");
  const text = element.value;

  const match = text.match(/^[a-zA-z]*/);
  const match2 = text.match(/\s*/);
  if (match2[0] === text) {
    results.innerHTML = "";
  }
  if (text && match[0] === text) {
    fetch("search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        results.innerHTML = "";
        let payload = data.payload;
        if (payload.length > 0) {
          for (res of payload) {
            const li = document.createElement("li");
            const h4 = document.createElement("h4");
            h4.textContent = res.username;
            li.appendChild(h4);
            results.append(li);
          }
        } else {
          results.innerHTML = "";
        }
      });
  }
}
