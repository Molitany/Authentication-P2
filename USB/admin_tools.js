const { remote } = require('electron');
const fs = require('fs');

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
    fetch("http://localhost:3000/MessageToUSB", {
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
        });
    })
    .catch(err => console.error(err));
}

function MessageGen(update) {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Update: update })
    })
        .then(res => {
            if (!res.ok)
                throw res;
            return res;
        })
        .then(res => {
            let element = document.getElementById("response_message");
            res.text().then(res => element.innerHTML = res);
            setTimeout(() => element.innerHTML = "", 5000);
        })
        .catch(err => {
            let element = document.getElementById("response_message");
            try{
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