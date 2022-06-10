var key ='AAAAAAAAAAAAAAAA'
key = CryptoJS.enc.Utf8.parse(key); 
var username = "";

// //connects to the site to tranfer data to the python file
var socket = io()

//makes you sign out
function ToSignIn(){
    window.location.replace("http://127.0.0.1:5000/log_in")
}

// var encrypted = CryptoJS.AES.encrypt(path.replace("'",""), key, {mode: CryptoJS.mode.ECB});
// encrypted =encrypted.toString();

// decrypted =  CryptoJS.AES.decrypt(info, key ,{mode:CryptoJS.mode.ECB});
// info = decrypted.toString(CryptoJS.enc.Utf8);

//call the server for a username
function GetUsername(){
    socket.emit("getusername")
}

socket.on('return', function(info){
    decrypted =  CryptoJS.AES.decrypt(info, key ,{mode:CryptoJS.mode.ECB});
    info = decrypted.toString(CryptoJS.enc.Utf8);

    username = info;
    document.getElementById("username").innerHTML = username;
});

function ToMain(){
    socket.emit("change",username)

    window.location.replace("http://127.0.0.1:5000//MainWindow")
}
