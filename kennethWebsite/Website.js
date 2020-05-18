//Deletes a website and password, from the website
document.getElementById("submit").addEventListener("click", e => {
    post_request(document.getElementById("Website").value, document.getElementById("Password").value)
    delete_table("tbody")
    bigfetch()
})
//Changes the website to lightmode
document.addEventListener('keypress', event => {
    console.log('Changed the theme to light theme');
    LightMode();
})
//Creates a new row in the vault
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
//The function delete, that deletes a tables from the website by referencing the table_id variable
function delete_table(table_id){
    let table = document.getElementById(table_id);
    table.innerHTML = ""
}
//Inserts a table into the website
function insert_table(table_id, data_obj) {
    data_obj = JSON.parse(data_obj)
    for (let i = 0; i < data_obj.length; i++) {
        create_row(i + 1, data_obj[i].ID, data_obj[i].password, table_id);
    }
}
//The post_request function that fetches the website and the password
function post_request(website, password) {
    fetch('https://localhost:3000', {
        method: 'POST',
        body: website + 0x1c + password
    })
        .then((response) => {
            response.text()
                .then(data => console.log(data));
        })
        .catch(err => console.log(err));
}
//Bigfetch is the function, that checks whether the server is running from the USB-devide
//And if so, GETs all the passwords from the server (that is not the one from the usb), 
//and inserts them into a table on the website
function bigfetch() {
    fetch('http://localhost:3001')
    .then(res => {  
        return res.json()
            .then(resJSON => {
                return resJSON
            });
    })
    .then(resJSON => {
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
                        console.log(data)
                        insert_table("tbody", data);
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
//Changes the overall theme of the website/
function LightMode(){
    document.getElementById('stylesheet').href = 'lightmode.css';
}
bigfetch()