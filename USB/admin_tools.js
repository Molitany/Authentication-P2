const { remote } = require('electron');
const fs = require('fs');
console.log(fs);

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

function MessageGen(update) {
    let UserID;
    if (update == false) {
        UserID = parseInt(fs.readFileSync('user_id.ini', 'utf8'));
        fs.writeFileSync('user_id.ini', UserID + 1);
    }
    fetch("http://localhost:3000/UpdateCreatePDID", {
        method: 'POST',
        body: JSON.stringify({ Username: document.getElementById('employee').value, Update: update, ID: UserID, MasterPw: 'hej' })
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