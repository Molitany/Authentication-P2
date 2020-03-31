function MessageGen(update) {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Update: update })
    })
        .then(res => {
            res.text().then(res => document.getElementById("error_Message").innerHTML = res);
            setTimeout(() => document.getElementById("error_Message").innerHTML = "", 3000);
        })
        .catch(err => console.error(err));
}
