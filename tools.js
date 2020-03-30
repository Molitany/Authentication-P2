function UpdateMessage() {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Message: MessageGeneration(), Update: true })
    })
        .then(() => console.log("done"))
        .catch(err => console.error(err));
}
function CreateMessage() {
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({ type: 'Message', Username: document.getElementById('employee').value, Message: MessageGeneration(), Update: false })
    })
        .then(() => console.log("done"))
        .catch(err => console.error(err));
}

function MessageGeneration() {
    let message = '';
    return fetch("http://localhost:3000/Keys")
        .then(publicKey => {

            let body = '';
            publicKey.on('data', chokn => body += chokn);

            publicKey.on('end', () => {
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;*-_¨^´`+?=)(/&%¤#"!}][{€$£@';
                for (i = 0; i < 32; i++) message += characters.charAt(Math.floor(Math.random() * characters.length));
                body = Buffer.from(JSON.parse(body));
                message = Buffer.from(message);
                message = crypto.publicEncrypt(body, message);
                resolve(message);
            })
        })
    
}