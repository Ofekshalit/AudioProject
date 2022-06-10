const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

//when clicked converts the password input text area from hidden to visible or the other way around
togglePassword.addEventListener("click", function () {
    // toggle the type attribute
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    
    // toggle the icon`
    this.classList.toggle("bi-eye");
    var audio = new Audio('RUMine-web.mp3');
    audio.play();
});


var socket = io();

// gets a result and if it is true it will send the client to the main page and if it false it will raise and error
socket.on('valid', function(result)
{
    // wavesurfer.load(sound);
    if(result){
        window.location.replace("http://127.0.0.1:5000/intro")
        // window.location.replace("http://127.0.0.1:5000//MainWindow")
    }
    else{
        document.getElementById("error3").innerHTML = "user does not exist"
    }
});


// it will send the client to the sign up page
function ToSignUp(){
    window.location.replace("http://127.0.0.1:5000/sign_up")
}


var username = "";
var pass = "";

// check if all the functions that were called returned true and send data to the server if it is
function Valid(){
    document.getElementById("error3").innerHTML = "";

    var passw = CheckPassword();
    var user = CheckUsername();

    if(passw && user){
        socket.emit("checkin", username + "/" + pass)
    }   
}


// check if the username is valid and send true/false accordingly
function CheckUsername(){
    username = document.getElementById("username").value;
    var str = "";
    if(username == ""){
        document.getElementById("error1").innerHTML = "enter a username";
        return false;
    }
    if(username.length > 8){
        str += "username is too long"
    }
    if( (/\s/g).test(username)){
        if(str==""){
            str+= "username must not have spaces"
        }
        else{
            str+= " and have spaces"
        }
    }
    if(str == ""){
        document.getElementById("error1").innerHTML = "";
        return true;
    }
    else{
        document.getElementById("error1").innerHTML = str;
        document.getElementById("username").value = "";
        return false;
    }
}

// check if the password is valid and send true/false accordingly
function CheckPassword(){
    pass = document.getElementById("password").value;
    var str = "";
    if(pass == ""){
        document.getElementById("error2").innerHTML = "enter a password";
        return false;
    }
    if(pass.length > 12){
        str += "password is too long"
    }
    if(str == ""){
        document.getElementById("error2").innerHTML = "";
        return true;
    }
    else{
        document.getElementById("error2").innerHTML = str;
        document.getElementById("password").value = "";
        return false;
    }
}