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
  return new Promise((resolve, reject) => {
    if (website + password.indexOf('\n') == -1 || website == '')
      reject("Invalid Website/Password")
    else {
      resolve(fetch('https://localhost:3000/PostPassword', {
        method: 'POST',
        body: website + '\t' + password
      }).then(response => {
        if (!response.ok)
          throw Error
      })
        .catch(err => {
          document.getElementById("ErrorAddText").innerText = err;
          //location.href = 'https://localhost:3000';
        }));
    }
  })
    .catch(err => {
      document.getElementById("ErrorAddText").innerText = err;
      setTimeout(() => {
        document.getElementById("ErrorAddText").innerText = '';
      }, 2000);
      //location.href = 'https://localhost:3000';
    });
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
  <button class="logoutBtn" onclick="logout()">Logout</button>
  </div>

  <div class="modal-footer">
  <h3>Developed by the P2 group at Aalborg University</h3>
  </div>
  `
};

/* Modal for user in top right corner */
SetUsername({ Username: 'Placeholder' });
let loginModal = document.getElementById("simpleModal");
let editModal = document.getElementById("editSimpleModal");
let confirmModal = document.getElementById("confirmSimpleModal");
let confirmButton = document.getElementById("confirmButton");
let modalBtn = document.getElementById("modalBtn");
let closeBtn = document.getElementsByClassName("closeBtn");
let ChangePasswordButton = document.getElementById("ChangePassword");
let CancelModalButton = document.getElementsByClassName("CancelButton");

modalBtn.addEventListener('click', openModal);

function openModal(element) {
  if (element.id == "editPswBtn")
    editModal.style.display = 'flex';
  else if (element.id == 'deleteButton')
    confirmModal.style.display = 'flex'
  else
    loginModal.style.display = 'flex';

  ChangePasswordButton.addEventListener('click', ChangePassword);
  ChangePasswordButton.params = element;

  confirmButton.addEventListener('click', DeleteRow);
  confirmButton.params = element;

  for (let i = 0; i < CancelModalButton.length; i++) {
    CancelModalButton[i].addEventListener('click', closeModal);
    CancelModalButton[i].params = element;
  }

  for (let i = 0; i < closeBtn.length; i++) {
    closeBtn[i].addEventListener('click', closeModal);
    closeBtn[i].params = element; 
  }

  window.addEventListener('click', clickOutside);
  window.addEventListener('keydown', clickOutside);
}

function closeModal(e) {
  if (e.currentTarget.params.id == "editPswBtn")
    editModal.style.display = 'none';
  else if (e.currentTarget.params.id == 'deleteButton')
    confirmModal.style.display = 'none'
  else
    loginModal.style.display = 'none';

  ChangePasswordButton.removeEventListener('click', ChangePassword);
  confirmButton.removeEventListener('click', DeleteRow);

  for (let i = 0; i < CancelModalButton.length; i++) {
    CancelModalButton[i].removeEventListener('click', closeModal);
  }

  for (let i = 0; i < closeBtn.length; i++) {
    closeBtn[i].removeEventListener('click', closeModal);
  }
}

function clickOutside(e) {
  if (e.target == loginModal) {
    loginModal.style.display = 'none';
  } else if (e.target == editModal) {
    editModal.style.display = 'none';
  } else if (e.target == confirmModal) {
    confirmModal.style.display = 'none';
  } else if (e.key == 'Escape') {
    editModal.style.display = 'none';
    loginModal.style.display = 'none';
    confirmModal.style.display = 'none';
  } else {
    return
  }

  ChangePasswordButton.removeEventListener('click', ChangePassword);
  confirmButton.removeEventListener('click', DeleteRow);

  for (let i = 0; i < CancelModalButton.length; i++) {
    CancelModalButton[i].removeEventListener('click', closeModal);
  }

  for (let i = 0; i < closeBtn.length; i++) {
    closeBtn[i].removeEventListener('click', closeModal);
  }
}

function passwordTemplate(password) {
  return `
        <tr>
            <td class="url-text">${password.ID}</td>
            <td id="psw" title="${password.password}" class="psw-text" onclick="ShowHide(this)">*********</td>
            <td class="button"><button onclick="copyToClipboard(this)"><i class="fas fa-copy fa-2x"></i></button></td>
            <td class="buttonDel"><button id="deleteButton" onclick="openModal(this)"><i class="fas fa-trash-alt fa-2x"></i></button></td>
            <td class="buttonEdit"><button id="editPswBtn" onclick="openModal(this)"><i class="fas fa-edit fa-2x"></i></button></td>
        </tr>
      `;
}

document.getElementById("submit").addEventListener("click", e => {
  PostPassword(document.getElementById("Website").value, document.getElementById("Password").value)
    .then(() => bigfetch())
    .catch(err => console.log(err));
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

function DeleteRow(e) {
  console.log(e.currentTarget.params.parentElement.parentElement.children[0].innerHTML.replace('\n', '\u000A'))
  let row = {
    UserID: getCookie('user-id'),
    Password: e.currentTarget.params.parentElement.parentElement.children[1]['title'],
    ID: e.currentTarget.params.parentElement.parentElement.children[0].innerText
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
  closeModal(e)
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

function ChangePassword(e) {
  let password = e.target.parentElement.children[0].value;
  if (password == '') {
    alert('You did not enter a password we assume you changed your mind')
    return
  }

  console.log(e.currentTarget.params.parentElement.parentElement.children[0].innerText)

  DeleteRow(e)
  PostPassword(e.currentTarget.params.parentElement.parentElement.children[0].innerText, password)
}

//Stolen from https://javascript.info/cookie#getcookie-name
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function logout() {
  document.cookie = 'masterpw=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'message=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  location.href = 'https://localhost:3000';
}