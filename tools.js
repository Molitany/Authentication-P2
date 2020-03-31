function MessageGen(update) {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Update: update })
    })
        .then(data => console.log(data))
        .catch(err => console.error(err));
}
