function get_request() {
  //Getting a response from the local server using fetch api
  return new Promise(resolve => {
    resolve(fetch('http://localhost:3000')
      .then((response) => {
        return response.text()
          .then(data => JSON.parse(data));
      })
      .catch(err => console.log(err))
    )
  });
}

function post_request(website, password) {
  console.log(password + website)
  fetch('http://localhost:3000', {
    method: 'POST',
    body: website + 0x1c + password
  })
    .then((response) => {
      response.text()
        .then(data => console.log(data));
    })
    .catch(err => console.log(err));
}

// function bigfetch() {
//   fetch('http://localhost:3001/%27)
//     .then(res => {
//       return res.json()
//         .then(resJSON => {
//           return resJSON
//         });
//     })
//     .then(resJson => {
//       console.log(resJson)
//       fetch('http://localhost:3000/Passwords', {
//         method: 'POST',
//         body: JSON.stringify(resJson)
//       })
//         .then((response) => {
//           console.log(response)
//           response.text()
//             .then(data => {
//               console.log(data)
//               insert_table("tbody", data);
//             });
//         })
//         .catch(err => console.log(err + 'BRERWER'));
//     })
//     .catch(err => {
//       document.getElementById("usbdevice").style = "color:red";
//       document.getElementById("usbdevice").innerHTML = "Please input USB device and start the server";
//     })
// }
// bigfetch()


function passwordTemplate(password) {
  return `
        <tr>
            <td class="url-text">${password.id}</td>
            <td id="psw" title="${password.password}" class="psw-text" onclick="ShowHide(this)">*********</td>
            <td class="button"><button onclick="copyToClipboard(this)"><i class="fas fa-copy fa-2x"></i></button></td>
            </tr>
      `;
}

document.getElementById("submit").addEventListener("click", e => {
  post_request(document.getElementById("Website").value, document.getElementById("Password").value);
  // bigfetch();
})

function ShowHide(id) {
  if (id.innerText === "*********") {
    id.innerText = id.title;
  } else if (id.innerText != "*********") {
    id.innerText = "*********";
  }
}

const copyToClipboard = (id) => {
  const toCopy = document.createElement('textarea');

  toCopy.value = id.parentElement.parentElement.children[1].title;
  document.body.appendChild(toCopy);
  toCopy.select();
  document.execCommand('copy');
  document.body.removeChild(toCopy);
};

get_request().then(password => {
  document.getElementById("app").innerHTML = `
  <p class="app-title">Password Vault (${password.length} results)</p>
<table class="box-title">
  <tr>
        <td class="url-text">Website</td>
        <td class="psw-title">Password</td>
  </tr>
</table>
<table class="box" id="table_body">
${password.map(passwordTemplate).join("")}
</table>

<p><br /><br /><br /></p>
<h1 class="footer">This password vault was made by the P2 group at Aalborg University: Thomas Damsgaard, Thor
    Beregaard, Simon Preuss, Sebastian Lindhart, Kenneth Køpke and Andreas Poulsen</h1>
<p><br /></p>
`
});