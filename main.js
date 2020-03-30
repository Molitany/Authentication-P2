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

function create_row(website, password, table_id){
    row = document.createElement('TR');
    table = document.getElementById(table_id);
    table.appendChild(row);
    td = document.createElement('TD');
    row.appendChild(td);
    td = document.createElement('TD');
    row.appendChild(td);
    row.childNodes[0].innerHTML = website;
    row.childNodes[1].innerHTML = password;
}
for (let i = 0; i < password_list.length; i++) {
    create_row(password_list[i].url, password_list[i].password, 'my_table');

}