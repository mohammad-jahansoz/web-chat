var socket = io();
var form = document.getElementById("form");
var input = document.getElementById("input");
const userId = document.getElementById("userId").value;
const chatId = document.getElementById("chatId").value;
const friendId = document.getElementById("friendId").value;
const messages = document.getElementById("messages");

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("image");
const uploadContainer = document.getElementById("uploadContainer");
imageUpload.addEventListener("change", () => {
  const input = document.getElementById("input");
  input.disabled = true;
  const selectedFile = imageUpload.files[0];
  // if (imageUpload && imageUpload.type.startsWith("image/")) {
  const reader = new FileReader();
  reader.onload = function (e) {
    imagePreview.src = e.target.result;
    uploadContainer.style.display = "block";
  };
  reader.readAsDataURL(selectedFile);
  // } else {
  // imagePreview.src = "";
  // imagePreview.style.display = "none";
  // }
});

const cancel = document.getElementById("cancel");
cancel.addEventListener("click", () => {
  uploadContainer.style.display = "none";
  imageUpload.value = null;
  imagePreview.src = "";
  const input = document.getElementById("input");
  input.disabled = false;
});

const send = document.getElementById("send");
send.addEventListener("click", function () {
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  input.disabled = false;
  const file = imageUpload.files[0];
  const formData = new FormData();
  formData.append("image", file);
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      const imageUrl = data.path;
      const publicString = "public";
      const newString = imageUrl.replace(publicString, "");
      socket.emit("sendImage", {
        imageUrl: newString,
        chatId: chatId,
        friendId: friendId,
        userId: userId,
        type: "img",
      });
      const img = document.createElement("img");
      img.src = newString;
      img.classList = "sendImage";
      const li = document.createElement("li");
      li.classList = "me";
      li.appendChild(img);
      messages.appendChild(li);
      uploadContainer.style.display = "none";
      imageUpload.value = null;
      imagePreview.src = "";
      messages.scrollTo(0, messages.scrollHeight);
    })
    .catch((error) => {
      console.error("Error send image", error);
    });
});

socket.emit("register", userId);

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (input.value) {
    const item = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = input.value;
    item.appendChild(p);
    item.classList.add("me");
    // item.style.animation = "pop 0.3s forwards";
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
    socket.emit("chat message", {
      pm: input.value,
      chatId: chatId,
      friendId: friendId,
      userId: userId,
      type: "text",
    });
    input.value = "";
  }
  // else if (imageUpload) {

  // }
});

socket.on("chat message", function (content) {
  if (content.userId === friendId) {
    const item = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = content.pm;
    item.appendChild(p);
    item.classList.add("he-she");
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
  } else {
    alert(`شما پیام دارید  :  ${content.pm.substring(0, 30)} ...`);
  }
});

socket.on("sendImage", function (content) {
  if (content.userId === friendId) {
    var item = document.createElement("li");
    const img = document.createElement("img");
    img.src = content.imageUrl;
    item.appendChild(img);
    item.classList.add("he-she");
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
  } else {
    alert(`شما پیام دارید  :  ${content.pm.substring(0, 30)} ...`);
  }
});

messages.scrollTo(0, messages.scrollHeight);
