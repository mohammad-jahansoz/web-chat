var socket = io();
var form = document.getElementById("form");
var input = document.getElementById("input");
const userId = document.getElementById("userId").value;
const chatId = document.getElementById("chatId").value;
const friendId = document.getElementById("friendId").value;

socket.emit("register", userId);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    var item = document.createElement("li");
    item.textContent = input.value;
    // item.style.textAlign = "right";
    item.classList.add("me");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
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
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    alert(`شما پیام دارید  :  ${content.pm.substring(0, 30)} ...`);
  }
});

function submitForm(li) {
  const form = li.querySelector("form");
  form.submit();
}
