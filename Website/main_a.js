bigfetch()
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

function PostPassword(website, password) {
  if (website == '') return;
  return new Promise(resolve => {
    resolve(fetch('https://localhost:3000/PostPassword', {
      method: 'POST',
      body: website + '\t' + password
    }).then(response => {
      if (!response.ok)
        throw Error
    })
      .catch(err => {
        console.table(err)
        //location.href = 'https://localhost:3000';
      })
    )
  }
  )
}
function bigfetch() {
  fetch('http://localhost:3001')
    .then(res => {
      return res.json()
        .then(resJSON => {
          return resJSON
        });
    })
    .then(resJSON => {
      SetUsername(resJSON);
      let userIDParameter = new Headers()
      userIDParameter.append('user-id', resJSON.UserID)
      fetch('https://localhost:3000/Passwords', {
        method: 'GET',
        headers: userIDParameter
      })
        .then((response) => {
          response.text()
            .then(data => {
              console.table(JSON.parse(data))
              WritePage(JSON.parse(data));
            });
        })
        .catch(err => console.log(err));
    })
    .catch(err => {
      console.log(err)
      document.getElementById("usbdevice").style = "color:red";
      document.getElementById("usbdevice").innerHTML = "Please input USB device and start the server";
    })
}

function SetUsername({ Username }) {
  document.getElementById('modal').innerHTML = `
  <div class="modal-header">
  <span id="closeBtn" class="closeBtn">+</span>
  <h2>Hello ${Username}</h2>
  </div>

  <div class="modal-body">
  <p>Remember to remove your USB device from the PC as you leave.</p>
  <button class="logoutBtn">Logout</button>
  </div>

  <div class="modal-footer">
  <h3>Developed by the P2 group at Aalborg University</h3>
  </div>
  `
};

/* Modal for user in top right corner */
SetUsername({ Username: 'Placeholder' });
let modal = document.getElementById("simpleModal");
let modalBtn = document.getElementById("modalBtn");
let closeBtn = document.getElementById("closeBtn");

modalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', clickOutside);


function openModal() {
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

function clickOutside(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
}

function passwordTemplate(password) {
  return `
        <tr>
            <td class="url-text">${password.ID}</td>
            <td id="psw" title="${password.password}" class="psw-text" onclick="ShowHide(this)">*********</td>
            <td class="button"><button onclick="copyToClipboard(this)"><i class="fas fa-copy fa-2x"></i></button></td>
            <td class="buttonDel"><button onclick="DeleteRow(this)"><i class="fas fa-trash-alt fa-2x"></i></button></td>
            <td class="buttonEdit"><button id="editPswBtn" onclick="ChangePassword(this)"><i class="fas fa-edit fa-2x"></i></button></td>
        </tr>
      `;
}

document.getElementById("submit").addEventListener("click", e => {
  PostPassword(document.getElementById("Website").value, document.getElementById("Password").value)
    .then(() => bigfetch())
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

window.onscroll = function () { scrollHeader(); }

let header = document.getElementById("myHeader");
let sticky = header.offsetTop;

function scrollHeader() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

function WritePage(password) {
  document.getElementById("app").innerHTML = `
<div class="hideboxes"><p>${password.length} total saved passwords <br/><hr style="width:70vh;text-align:center;"><br/></p></div>
<table class="box" id="table_body">
${password.map(passwordTemplate).join("")}
</table>
<p><br /><br /><br /></p>
<h1 class="footer">This password vault was made by the P2 group at Aalborg University: Thomas Damsgaard, Thor
    Beregaard, Simon Preuss, Sebastian Lindhart, Kenneth Køpke and Andreas Poulsen</h1>
<p><br /></p>
`
};

function DeleteRow(element, change) {
  let row = {
    UserID: getCookie('user-id'),
    Password: element.parentElement.parentElement.children[1]['title'],
    ID: element.parentElement.parentElement.children[0].innerText
  }
  fetch('https://localhost:3000/', {
    method: 'DELETE',
    body: JSON.stringify(row)
  })
    .then(res => {
      if (!res.ok)
        throw Error
    })
    .catch(err => {
      location.href = 'https://localhost:3000';
    })
  bigfetch()
}
function search() {
  let search_text = document.getElementById("search").value.toLowerCase();
  let table = document.getElementById("table_body");
  let a = table.rows;
  for (i = 0; i < a.length; i++) {
    let specific_value = a[i].cells[0].innerText.toLowerCase();
    if (specific_value.indexOf(search_text) != -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
function ChangePassword(element) {
  let password
  if (confirm(`Are you sure you want to change ${element.parentElement.parentElement.children[0].innerText}?`))
    password = prompt('What should the new password be?');
  if (password == '') {
    alert('You did not enter a password we assume you changed your mind')
    return
  }
  DeleteRow(element, true)
  PostPassword(element.parentElement.parentElement.children[0].innerText, password)
}
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}