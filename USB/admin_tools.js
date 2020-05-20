const { remote } = require('electron');
const fs = require('fs');
const crypto = require('crypto');
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
    GetNonce().then(nonce => {
        let cnonce = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('base64')).digest('base64');
        let payload = 'AdminPDIDToUSB';
        let hash = crypto.createHash('sha256').update(nonce + cnonce + payload).digest('base64');
        fetch("https://localhost:3000/PDIDToUSB", {
            method: 'POST',
            body: JSON.stringify({
                Username: document.getElementById('employee').value,
                hash: hash,
                cnonce: cnonce,
                payload: payload
            })
        })
            .then(res => {
                if (res.status === 202) {
                    res.json().then(users => {
                        ShowUsersFound(users, 'USB');
                    })
                }
                if (!res.ok)
                    throw res;
                return res;
            })
            .then(res => {
                res.text().then(data => {
                    fs.writeFileSync("E:\\test.key", data);
                    document.getElementById("response_message").style = "color: green;";
                    document.getElementById("response_message").innerText = "USB has been written to"
                });
            })
            .catch(err => console.error(err));
    })
}

function UserGen(update) {
    GetNonce().then(nonce => {
        let cnonce = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('base64')).digest('base64');
        let payload = 'AdminUserGen';
        let hash = crypto.createHash('sha256').update(nonce + cnonce + payload).digest('base64');
        let UserID
        try {
            UserID = parseInt(fs.readFileSync('user_id.ini', 'utf8'));
            if (isNaN(UserID)){
                throw TypeError
            }
        } catch (e) {
            fetch('https://localhost:3000/GetLastUserID').then(res => {
                res.text().then(data => {
                    fs.writeFileSync('user_id.ini', data);
                    UserID = parseInt(data);
                });
            });
        }
        if (update == false) {
            fs.writeFileSync('user_id.ini', UserID + 1);
            fetch("https://localhost:3000/UpdateCreatePDID", {
                method: 'POST',
                body: JSON.stringify({
                    Username: document.getElementById('employee').value,
                    Update: update,
                    ID: UserID,
                    MasterPw: document.getElementById('masterpw').value,
                    Info: document.getElementById('info').value,
                    hash: hash,
                    cnonce: cnonce,
                    payload: payload
                })
            }).then(res => {
                res.ok ? document.getElementById("response_message").style = "color: green;" : document.getElementById("response_message").style = "color: red;";
                res.text().then(data => {
                    delete_table("tbody")
                    document.getElementById("response_message").innerText = data
                    setTimeout(() => document.getElementById("response_message").innerHTML = "", 5000);
                });
            })
        } else {
            fetch("https://localhost:3000/UpdateCreatePDID", {
                method: 'POST',
                body: JSON.stringify({
                    Username: document.getElementById('employee').value,
                    Update: update,
                    ID: UserID,
                    MasterPw: document.getElementById('masterpw').value,
                    Info: document.getElementById('info').value,
                    hash: hash,
                    cnonce: cnonce,
                    payload: payload
                })
            })
                .then(res => {
                    element = document.getElementById("response_message");
                    if (res.status === 202) {
                        res.json().then(users => {
                            ShowUsersFound(users, 'PDID', update, UserID);
                        })
                    }
                    if (!res.ok)
                        throw res;
                    return res;
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
    })
}


function ShowUsersFound(users, type, update, UserID) {
    delete_table("tbody")
    insert_table('tbody', users, type, update, UserID)
}


function insert_table(table_id, data_obj, type, update, UserID) {
    for (let i = 0; i < data_obj.length; i++) {
        create_row(data_obj[i].Username, data_obj[i].Info, data_obj[i].CreatedAt, table_id, type, update, UserID);
    }
}

function create_row(username, info, createdAt, table_id, type, update, UserID) {
    let table = document.getElementById(table_id);
    let row = document.createElement('TR');
    row.setAttribute("onclick", `ChooseUser(this.children[1].innerText, '${type}', ${update}, ${UserID})`)
    table.appendChild(row);
    for (let i = 0; i < 3; i++) {
        let td = document.createElement('TD');
        row.appendChild(td);
    }
    row.childNodes[0].innerHTML = username;
    row.childNodes[1].innerHTML = info;
    row.childNodes[2].innerHTML = createdAt;
}

function delete_table(table_id) {
    let table = document.getElementById(table_id);
    table.innerHTML = ""
}

function ChooseUser(info, type, update, UserID) {
    GetNonce().then(nonce => {
        let cnonce = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('base64')).digest('base64');
        let payload, hash;
        switch (type) {
            case 'USB':
                payload = 'AdminPDIDToUSB';
                hash = crypto.createHash('sha256').update(nonce + cnonce + payload).digest('base64');
                fetch("https://localhost:3000/ChooseUserUSB", {
                    method: 'POST',
                    body: JSON.stringify({
                        Info: info,
                        hash: hash,
                        cnonce: cnonce,
                        payload: payload
                    })
                })
                    .then(res => {
                        res.ok ? document.getElementById("response_message").style = "color: green;" : document.getElementById("response_message").style = "color: red;";
                        res.text().then(data => {
                            fs.writeFileSync("E:\\test.key", data);
                            delete_table("tbody")
                            document.getElementById("response_message").innerText = 'USB Written'
                            setTimeout(() => document.getElementById("response_message").innerHTML = "", 5000);
                        });
                    })
                    .catch(err => console.error(err));
                break;

            case 'PDID':
                payload = 'AdminUserGen';
                hash = crypto.createHash('sha256').update(nonce + cnonce + payload).digest('base64');
                fetch("https://localhost:3000/ChooseUserPDID", {
                    method: 'POST',
                    body: JSON.stringify({
                        Username: document.getElementById('employee').value,
                        Update: update,
                        ID: UserID,
                        MasterPw: document.getElementById('masterpw').value,
                        NewInfo: document.getElementById('info').value,
                        Info: info,
                        hash: hash,
                        cnonce: cnonce,
                        payload: payload
                    })
                })
                    .then(res => {
                        res.ok ? document.getElementById("response_message").style = "color: green;" : document.getElementById("response_message").style = "color: red;";
                        res.text().then(data => {
                            delete_table("tbody")
                            document.getElementById("response_message").innerText = data
                            setTimeout(() => document.getElementById("response_message").innerHTML = "", 5000);
                        });
                    })
                    .catch(err => console.error(err));
                break;

            default:
                break;
        }
    });
}

function KeyGen() {
    if (!confirm("this will break the database for authentication ::DEBUG::"))
        return
    else {
        GetNonce().then(nonce => {
            let cnonce = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('base64')).digest('base64');
            let payload = 'AdminKeyGen';
            let hash = crypto.createHash('sha256').update(nonce + cnonce + payload).digest('base64');
            const keys = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase: 'VIgIlanT37diRt68GRaftED69RAdIatE55rIgIdity35sHoWdOwn62diSaBLe04pupILs'
                }
            });

            fetch("https://localhost:3000/PriPubKeys", {
                method: 'Post',
                body: JSON.stringify({
                    PublicKey: keys.publicKey,
                    PrivateKey: keys.privateKey,
                    passphrase: 'VIgIlanT37diRt68GRaftED69RAdIatE55rIgIdity35sHoWdOwn62diSaBLe04pupILs',
                    hash: hash,
                    cnonce: cnonce,
                    payload: payload
                })
            }).then(res => {
                res.ok ? document.getElementById("response_message").style = "color: green;" : document.getElementById("response_message").style = "color: red;";
                res.text().then(data => {
                    delete_table("tbody")
                    document.getElementById("response_message").innerText = data
                    setTimeout(() => document.getElementById("response_message").innerHTML = "", 5000);
                });
            });
        })
    }
}

function GetNonce() {
    return new Promise((resolve, reject) => {
        fetch("https://localhost:3000/Nonce").then(res => {
            res.text().then(nonce => {
                resolve(nonce);
            });
        });
    }).catch(err => console.log(err));
}