const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");


togglePassword.addEventListener("click", function () {
    // toggle the type attribute
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    
    // toggle the icon
    this.classList.toggle("bi-eye");
});


const togglePassword2 = document.querySelector("#togglePassword2");
const password2 = document.querySelector("#reppassword");

togglePassword2.addEventListener("click", function () {
    // toggle the type attribute
    const type = password2.getAttribute("type") === "password" ? "text" : "password";
    password2.setAttribute("type", type);
    
    // toggle the icon
    this.classList.toggle("bi-eye");
});

// both togglePassword 1 and 2 when clicked converts the password input text area from hidden to visible or the other way around

var socket = io();

// gets a result and if it is true it will send the client to the main page and if it false it will raise and error
socket.on('correct', function(result)
{
    // wavesurfer.load(sound);
    if(result){
        window.location.replace("http://127.0.0.1:5000//intro")
        // window.location.replace("http://127.0.0.1:5000//MainWindow")

    }
    else{
        document.getElementById("error4").innerHTML = "user already exists"
    }
});

// it will send the client to the sign in page
function ToSignIn(){
    window.location.replace("http://127.0.0.1:5000/log_in")
}

var username = "";
var pass = "";

// check if all the functions that were called returned true and send data to the server if it is
function Valid(){
    var passw = CheckPassword();
    var user = CheckUsername();
    var repe = CheckPasswordRepeat();

    if(passw && user && repe){
        socket.emit("checkup", username + "/" + pass)
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

// check if the password repeate is valid and send true/false accordingly
function CheckPasswordRepeat(){
    var rep = document.getElementById("reppassword").value;
    var str = "";
    if(rep == ""){
        document.getElementById("error3").innerHTML = "enter the password again";
        return false;
    }
    if(rep != pass){
        str += "password does not match the original"
    }
    if(str == ""){
        document.getElementById("error3").innerHTML = "";
        return true;
    }
    else{
        document.getElementById("error3").innerHTML = str;
        document.getElementById("reppassword").value = "";
        return false;
    }
}