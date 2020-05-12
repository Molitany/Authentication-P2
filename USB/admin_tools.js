const { remote } = require('electron');
const fs = require('fs');
let element = "";

window.onload = () => {
    document.getElementById("min_button").addEventListener("click", () => {
        remote.getCurrentWindow().minimize();
    });
    document.getElementById("max_button").addEventListener("click", () => {
        if (remote.getCurrentWindow().isMaximized())
            remote.getCurrentWindow().unmaximize();
        else
            remote.getCurrentWindow().maximize();
    });
    document.getElementById("close_button").addEventListener("click", () => {
        remote.getCurrentWindow().close();
    });
}

function MessageToUSB() {
    fetch("http://localhost:3000/PDIDToUSB", {
        method: 'POST',
        body: document.getElementById('employee').value
    })
        .then(res => {
            if (res.status === 202){
                res.json().then(users => {
                    ShowUsersFound(users);
                })
            }
            if (!res.ok)
                throw res;
            return res;
        })
        .then(res => {
            res.text().then(res => {
                fs.writeFileSync("E:\\test.key", res);
                document.getElementById("response_message").style = "color: green;";
                document.getElementById("response_message").innerText = "USB has been written to"
            });
        })
        .catch(err => console.error(err));
}

function ShowUsersFound(users){
    insert_table('tbody', users)
    
}

function MessageGen(update) {
    let UserID;
    if (update == false) {
        UserID = parseInt(fs.readFileSync('user_id.ini', 'utf8'));
        fs.writeFileSync('user_id.ini', UserID + 1);
    }
    console.log(UserID)
    fetch("http://localhost:3000/UpdateCreatePDID", {
        method: 'POST',
        body: JSON.stringify({ Username: document.getElementById('employee').value, Update: update, ID: UserID, MasterPw: document.getElementById('masterpw').value, Info: document.getElementById('info').value})
    })
        .then(res => {
            element = document.getElementById("response_message");
            if (!res.ok)
                throw res;
            return res;
        })
        .then(res => {
            res.text().then(res => {
                element.style = "color: green;";
                element.innerHTML = res;
            });
            setTimeout(() => element.innerHTML = "", 5000);
        })
        .catch(err => {
            try {
                err.text().then(res => {
                    if (err.status === 400) {
                        element.innerHTML = res;
                        element.style = "color: red;";
                        setTimeout(() => {
                            element.innerHTML = "";
                            element.style = "";
                        }, 4000);
                    }
                });
            }
            catch{
                element.innerHTML = `(${err}): Server is probably down.`;
                element.style = "color: red;";
                setTimeout(() => {
                    element.innerHTML = "";
                    element.style = "";
                }, 4000);
            }
        });
}

function insert_table(table_id, data_obj) {
    for (let i = 0; i < data_obj.length; i++) {
        create_row(data_obj[i].Username, data_obj[i].Info, table_id);
    }
}

function create_row(username, info, table_id) {
    table = document.getElementById(table_id);
    row = document.createElement('TR');
    table.appendChild(row);
    for (let i = 0; i < 3; i++) {
        td = document.createElement('TD');
        row.appendChild(td);
    }
    row.childNodes[0].innerHTML = username;
    row.childNodes[1].innerHTML = info;
}