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

function passwordTemplate(password) {
  return `
      <div>
      <table class="box">
        <tr>
            <td class="url-text">${password.id}</td>
            <td id="psw" class="psw-text" onclick="ShowHide()">*********</td>
            <button onclick="copyToClipboard()" class="button"><i class="fas fa-copy fa-2x"></i></button>
        </tr>
      </table>
      </div>
      `;
}

function ShowHide(password){
  if (document.getElementById("psw").innerText === "*********"){
    document.getElementById("psw").innerText = password.password;
  } else if (document.getElementById("psw").innerText != "*********") {
    document.getElementById("psw").innerText = "*********";
  }
}

const copyToClipboard = () => {
  const toCopy = document.createElement('textarea');
  if (document.getElementById("psw").innerText != "*********"){
    toCopy.value = document.getElementById("psw").innerText;
    document.body.appendChild(toCopy);
    toCopy.select();
    document.execCommand('copy');
    document.body.removeChild(toCopy);
    if(toCopy.value != undefined && toCopy.value != "*********"){
      alert("Copied the password: "+ toCopy.value);
    }
  } else {
    alert("You need to show the password before copying!")
  }
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
${password.map(passwordTemplate).join("")}
`
});