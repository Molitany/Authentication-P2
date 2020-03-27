function UpdateMessage(){
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({Username: username, Message: message, Update: true})
    })
    .then(() => console.log("done"))
    .catch(err => console.error(err));
}
function CreateMessage(){
    fetch("http://localhost:3000/Message", {
        method: 'POST',
        body: JSON.stringify({Username: username, Message: message, Update: false})
    })
    .then(() => console.log("done"))
    .catch(err => console.error(err));
}