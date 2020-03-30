function UpdateMessage() {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Message: MessageGeneration(), Update: true })
    })
        .then(() => console.log("done"))
        .catch(err => console.error(err));
}
function CreateMessage() {
    let message = '';
    MessageGeneration().then(data => {
        fetch("http://localhost:3000/Message", {
            method: 'POST',
            body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Message: data, Update: false })
        })
            .then(() => console.log("done"))
            .catch(err => console.error(err));
    })
}

function MessageGeneration() {
    let message = 'Do this get changed?';
    return new Promise(resolve => {
        resolve(fetch("http://localhost:3000/Keys")
            .then(publicKey => {
                return publicKey.json().then(data => data);
            })
            .then(data => {
                return data;
            })
        )
    });
}