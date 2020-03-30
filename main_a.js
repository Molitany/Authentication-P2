let password_list = [
    {
        url: "Facebook.com",
        password: "DSAJska34SLKgl421#"
    },
    {
        url: "Google.com",
        password: "DMknmSDA5æjdssaØ"
    },
    {
        url: "Youtube.com",
        password: "DKSÆdsa3421DSaK!s"
    }
]

function passwordTemplate(password) {
    return `
      <div>
      <table class="box">
        <tr>
            <td class="url-text">${password.url}</td>
            <td class="psw-text">${password.password}</td>
        </tr>
      </table>
      </div>
    `;
  }

document.getElementById("app").innerHTML = `
<p class="app-title">Password Vault (${password_list.length} results)</p>
<table class="box-title">
  <tr>
        <td class="url-text">Website</td>
        <td class="psw-title">Password</td>
  </tr>
</table>
${password_list.map(passwordTemplate).join("")}
`