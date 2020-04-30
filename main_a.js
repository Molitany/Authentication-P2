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
        <tr>
            <td class="url-text">${password.id}</td>
            <td id="psw" title="${password.password}" class="psw-text" onclick="ShowHide(this)">*********</td>
            <button onclick="copyToClipboard(this)" class="button"><i class="fas fa-copy fa-2x"></i></button>
        </tr>
      `;
}

function ShowHide(id){
  if (id.innerText === "*********"){
    id.innerText = id.title;
  } else if (id.innerText != "*********") {
    id.innerText = "*********";
  }
}

const copyToClipboard = (id) => {
  const toCopy = document.createElement('textarea');
  
    toCopy.value = id.parentElement.children[1].children[0].children[0].children[1].title;
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

<p><br /><br /><br /><br /></p>
<h1 class="footer">This password vault was made by the P2 group at Aalborg University: Thomas Damsgaard, Thor
    Beregaard, Simon Preuss, Sebastian Lindhart, Kenneth Køpke and Andreas Poulsen</h1>
`
});