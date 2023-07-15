function submitForm(li) {
  console.log(li);
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
            const form = document.createElement("form");
            form.action = "/" + res.username;
            form.method = "POST";
            const input = document.createElement("input");
            input.name = "friendId";
            input.value = res._id;
            input.type = "hidden";
            const img = document.createElement("img");
            img.src = res.imageUrl;
            form.appendChild(input);
            form.appendChild(img);
            const h4 = document.createElement("h4");
            const span = document.createElement("span");
            h4.textContent = res.username;
            span.appendChild(h4);
            form.appendChild(span);
            li.appendChild(form);
            li.addEventListener("click", function () {
              submitForm(li);
            });
            results.appendChild(li);
            // results.append(li);
          }
        } else {
          results.innerHTML = "";
        }
      });
  }
}
