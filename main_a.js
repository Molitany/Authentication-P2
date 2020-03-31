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
            <td class="psw-text">${password.password}</td>
        </tr>
      </table>
      </div>
    `;
}
get_request().then(data => {
  document.getElementById("app").innerHTML = `
<p class="app-title">Password Vault (${data.length} results)</p>
<table class="box-title">
  <tr>
        <td class="url-text">Website</td>
        <td class="psw-title">Password</td>
  </tr>
</table>
${data.map(passwordTemplate).join("")}
`
});
