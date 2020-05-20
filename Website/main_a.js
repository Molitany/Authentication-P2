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

function post_request(website, password) {
  if (website == '') return;
  return new Promise(resolve => {
    resolve(fetch('http://localhost:3001')
      .then(res => {
        return res.json()
          .then(resJSON => {
            return resJSON
          });
      })
      .then(resJSON => {
        console.log(resJSON)
        let myheaders = new Headers()
        myheaders.append('user-id', resJSON.UserID)
        fetch('https://localhost:3000/PostPassword', {
          method: 'POST',
          body: website + '\t' + password,
          headers: myheaders
        })
          .catch(err => console.log(err));
      })
      .catch(err => {
        console.log(err)
        document.getElementById("usbdevice").style = "color:red";
        document.getElementById("usbdevice").innerHTML = "Please input USB device and start the server before posting passwords";
      })
    )
  })
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
        method: 'GET', //Should be get GET,
        headers: userIDParameter
      })
        .then((response) => {
          console.log(response)
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

function SetUsername({Username}) {
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

SetUsername({Username: 'Placeholder'});
let modal = document.getElementById("simpleModal");
let modalBtn = document.getElementById("modalBtn");
let closeBtn = document.getElementById("closeBtn");

modalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', clickOutside);
console.log(closeBtn);

function openModal() {
  modal.style.display = 'flex';
}

function closeModal() {
  console.log(modal.style.display);
  modal.style.display = 'none';
}

function clickOutside(e) {
  if(e.target == modal) {
    modal.style.display = 'none';
  } 
}

function passwordTemplate(password) {
  return `
        <tr>
            <td class="url-text">${password.ID}</td>
            <td id="psw" title="${password.password}" class="psw-text" onclick="ShowHide(this)">*********</td>
            <td class="button"><button onclick="copyToClipboard(this)"><i class="fas fa-copy fa-2x"></i></button></td>
            <td class="buttonDel"><button onclick="deleteRow(this)"><i class="fas fa-trash-alt fa-2x"></i></button></td>
        </tr>
      `;
}

document.getElementById("submit").addEventListener("click", e => {
  post_request(document.getElementById("Website").value, document.getElementById("Password").value)
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

window.onscroll = function() {scrollHeader();}

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

function deleteRow(element){
  // Send options request then send delete request for one row in database
  if(confirm(`Are you sure you want to delete ${element.parentElement.parentElement.children[0].innerText}?`)){
    fetch('https://localhost:3000/DeletePassword', { method: 'DELETE' })
      .then(() => console.log('Row deleted'))
      .catch(err => console.log(`Could not delete, error: ${err}`))
   bigfetch()
  }
  else
    return
}