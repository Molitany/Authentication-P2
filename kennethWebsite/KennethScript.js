function DoSomething() {
    // alert("Hello World");
    console.log("Hello");

}

DoSomething();


function check() {

    let User1 = {
        id: 12345,
        password: 123

    }
    let input_username = document.getElementById("IDnumber");
    let input_password = document.getElementById("password");
    try {
        if (input_username.value == User1.id && input_password.value == User1.password) {
            console.log("2");
            return true;


        } else {
            console.log("3");
            return false;
        }
    } catch (error)

    {

    }
}