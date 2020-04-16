document.getElementById("submit").addEventListener("click", e => {
    post_request(document.getElementById("Website").value, document.getElementById("Password").value)
    delete_table("tbody")
    bigfetch()
})

function create_row(number, website, password, table_id) {
    table = document.getElementById(table_id);
    row = document.createElement('TR');
    table.appendChild(row);
    for (let i = 0; i < 3; i++) {
        td = document.createElement('TD');
        row.appendChild(td);
    }
    row.childNodes[0].innerHTML = number;
    row.childNodes[1].innerHTML = website;
    row.childNodes[2].innerHTML = password;
}

function delete_table(table_id) {
    let table = document.getElementById(table_id);
    //smile
    table.innerHTML = ""
}

function insert_table(table_id, data_obj) {
    data_obj = JSON.parse(data_obj)
    for (let i = 0; i < data_obj.length; i++) {
        create_row(i + 1, data_obj[i].id, data_obj[i].password, table_id);
    }
}

function post_request(website, password) {
    fetch('http://localhost:3000', {
            method: 'POST',
            body: website + 0x1c + password
        })
        .then((response) => {
            response.text()
                .then(data => console.log(data));
        })
        .catch(err => console.log(err));
}

function bigfetch() {
    fetch('http://localhost:3001')
        .then(res => {
            return res.json()
                .then(resJSON => {
                    return resJSON
                });
        })
        .then(resJson => {
            console.log(resJson)
            fetch('http://localhost:3000/Passwords', {
                    method: 'POST',
                    body: JSON.stringify(resJson)
                })
                .then((response) => {
                    console.log(response)
                    response.text()
                        .then(data => {
                            console.log(data)
                            insert_table("tbody", data);
                        });
                })
                .catch(err => console.log(err + 'BRERWER'));
        })
        .catch(err => {
            document.getElementById("usbdevice").style = "color:red";
            document.getElementById("usbdevice").innerHTML = "Please input USB device and start the server";
        })
}
bigfetch()