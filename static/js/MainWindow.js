//input file object
let fileInput = document.getElementById("audio_file");
let audioObj = new Audio();
const border1 = 605;
const border2 = 1716;
const portion = border2 - border1;
var duration = 0;
var ratio = 0;
var fadeboundry = 0;
var currentduration = 0;
var ratiofadein = 0;
var ratiofadeout = 0;
var ready = false;
var username = "";
var songs = [];
var firsttopos = 150;
const list = document.querySelector("#list")
var lastclicked = 1;
var lastid = 0;
var alreadySaved= false;
var position = 0
var newexist = false;
var lastpath = "";
var lastname = "";
var playready = false;

var key ='AAAAAAAAAAAAAAAA'
key = CryptoJS.enc.Utf8.parse(key); 



//check if the page was reloaded
const pageAccessedByReload = (
    (window.performance.navigation && window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload')
);
  


// //connects to the site to tranfer data to the python file
var socket = io()


//the soundwave of the file that was given
document.getElementById("waveform").style.display = "none";
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#00ff66',
    progressColor: '#00ff66',
    barWidth: 4,
    barHeight:	1,
    scrollParent: false,
    height: 185,
    cursorWidth:3,
    cursorColor: 'black',
    plugins: [
        WaveSurfer.cursor.create({
            showTime: true,
            opacity: 1,
            customShowTimeStyle: {
                'background-color': '#000',
                color: '#fff',
                padding: '2px',
                'font-size': '10px'
            }
        })
    ]
});
var created = true;

//changes the style of the pages when the user selected the file
fileInput.onchange = () => {
    document.getElementById("waveloader").style.display  = "block"
    ChangeSurfer(fileInput.files[0])
}

var reader = new FileReader();

// gets a path and changes some of the css of the page's elements and load the audio file that was given or send the file path to the python 
function ChangeSurfer(path){
    document.getElementById("waveform").style.display = "block";
    document.getElementById("display").style.display = "none";
    // alert(fileInput.value);
    if(typeof(path) != "string"){
        alreadySaved = false;
        wavesurfer.load(URL.createObjectURL(path));
        ready = false;
        document.getElementById("specsloader").style.display = "block";
    }
    else{
        var encrypted = CryptoJS.AES.encrypt(path.replace("'",""), key, {mode: CryptoJS.mode.ECB});
        encrypted =encrypted.toString();

        socket.emit('getfile', encrypted);
    }
    // var audio = new Audio("http://127.0.0.1:8887/rumineweb.mp3");
    // audio.play();
    document.getElementById("drop-zone").style.border = "none";
    document.getElementById("drop-zone").style.background = "transparent";
    document.getElementById("drop-zone").style.outline = "none";
    // document.getElementById("drop-zone").style.height = "80%;";
    document.getElementById("crop_right").style.display = "block";
    document.getElementById("crop_left").style.display = "block";
    document.getElementById("remove").style.display = "block";
    document.getElementById("rightsec").setAttribute("max", wavesurfer.getDuration());
    document.getElementById("leftsec").value = 0;

    $('#plps').prop('disabled', false);
    document.getElementById("plps").style.cursor = "pointer";
    $('#vol').prop('disabled', false);
    $('#speed').prop('disabled', false);

    $('#leftminus').prop('disabled', false);
    $('#leftsec').prop('disabled', false);
    $('#leftplus').prop('disabled', false);

    $('#rightminus').prop('disabled', false);
    $('#rightsec').prop('disabled', false);
    $('#rightplus').prop('disabled', false);

    $('#fadein').prop('disabled', false);
    $('#fadeout').prop('disabled', false);

    $('#save').prop('disabled', false);
    $('#name').prop('disabled', false);
    $('#path').prop('disabled',false);

    document.getElementById("skipfor").style.cursor = "pointer";
    document.getElementById("skipback").style.cursor = "pointer";

    document.getElementById("restart").style.cursor = "pointer";
    document.getElementById("cropres").style.cursor = "pointer";

    if(newexist){
        newexist = false;
    }
}

// when the wavesurfer is ready the functions sets the elements that are envolved in editing the audio and send information about the file to the server
wavesurfer.on('ready', function () {
    document.getElementById("waveloader").style.display = "none";
    duration = wavesurfer.getDuration();
    // document.getElementById("rightsec").value = duration.toFixed(3);
    ratio = duration/portion;
    currentduration = wavesurfer.getDuration();
    fadeboundry = Math.floor(currentduration/2);
    ready = true;
    
    if(!created){
        document.getElementById("leftsec").value = 0;
        document.getElementById("rightsec").value = currentduration;
    }

    if(document.getElementById("leftsec").value == "0"){
        cropleft.style.left =  (border1+10) + "px";
    }
    else{
        cropleft.style.left =  ((parseInt(document.getElementById("leftsec").value))/ratio + (border1+10)) + "px";
    }
    cropright.style.left = (parseInt(document.getElementById("rightsec").value)/ratio + (border1+10)) + "px"
    

    if(parseInt(document.getElementById("rightsec").value) == Math.floor(wavesurfer.getDuration())){
        cropright.style.left = border2 + "px";
    }

    if(playready){
        playready = false;
        var btn = $(".button");
        btn.click();
        wavesurfer.play((getOffset(cropleft).left - (length+5))*ratio);
    }

    if(!alreadySaved){
        var encrypted = CryptoJS.AES.encrypt(fileInput.value +"/" + username+"/" + wavesurfer.getDuration(), key, {mode: CryptoJS.mode.ECB});
        encrypted =encrypted.toString();
        socket.emit('create',encrypted);
        alreadySaved = false;
    }
});


// gets called and change the position = position - 1 and calls the function Magnify and send to the server the id of the specific audio file
var alldelete = false;
function DeleteSong(){
    if(ready){
        var encrypted = CryptoJS.AES.encrypt(username + "/" + lastclicked, key, {mode: CryptoJS.mode.ECB});
        encrypted =encrypted.toString();

        socket.emit("deletesong",encrypted)

        position -= 1;

        filename = document.getElementById("search").value = ""
        alldelete = true;
    
        Magnify()
    }
}

//gets called and chanegs the css so it will seem like the user need to pick a new file
function Remove(){
    if(isPlaying){
        var btn = $(".button");
        btn.toggleClass("paused");
        wavesurfer.pause();
    }
    document.getElementById("waveform").style.display = "none";
    document.getElementById("display").style.display = "block";
    // alert(fileInput.value);
    CropRestart();
    wavesurfer.setVolume(1);
    wavesurfer.setPlaybackRate(1);
    wavesurfer.empty();
    fileInput.value = null;
    created = false;
    document.getElementById("drop-zone").style.border = "4px dashed rgb(64, 120, 224, 0.5)";
    document.getElementById("drop-zone").style.background = "white";
    document.getElementById("drop-zone").style.outline = "10px solid rgb(64, 120, 224, 0.5)";
    // document.getElementById("drop-zone").style.height = "80%;";
    document.getElementById("crop_right").style.display = "none";
    document.getElementById("crop_left").style.display = "none";
    document.getElementById("remove").style.display = "none";

    $('#plps').prop('disabled', true);
    document.getElementById("plps").style.cursor = "default";
    $('#vol').prop('disabled', true);
    $('#speed').prop('disabled', true);

    $('#leftminus').prop('disabled', true);
    $('#leftsec').prop('disabled', true);
    $('#leftplus').prop('disabled', true);

    $('#rightminus').prop('disabled', true);
    $('#rightsec').prop('disabled', true);
    $('#rightplus').prop('disabled', true);

    $('#fadein').prop('disabled', true);
    $('#fadeout').prop('disabled', true);

    $('#save').prop('disabled', true);
    $('#name').prop('disabled', true);
    $('#path').prop('disabled', true);

    document.getElementById("skipfor").style.cursor = "default";
    document.getElementById("skipback").style.cursor = "default";

    document.getElementById("restart").style.cursor = "pointer";
    document.getElementById("cropres").style.cursor = "pointer" 
    duration = 0;
    ratio = 0;
    fadeboundry = 0;
    currentduration = 0;
    ratiofadein = 0;
    ratiofadeout = 0;

    isPlaying = false;

    document.getElementById("name").value = "";
    document.getElementById("edited").value = "";

    document.getElementById("rightsec").value = "";
    
    document.getElementById("vol").value = 100;
    document.getElementById("vol_result").innerHTML = "100%";
    document.getElementById("vol").style.background = "linear-gradient(to right, rgb(0 255 102) 0%, #19d7a5 33.333333%, black 28.2828%, black 100%)";
    
    document.getElementById("speed").value = 1;
    document.getElementById("speed_result").innerHTML = "1"  + "x";
    document.getElementById("speed").style.background = "linear-gradient(to right, rgb(0 255 102) 0%, #19d7a5 50%, black 28.2828%, black 100%)";

    document.getElementById("fadein").value = 0;
    document.getElementById("fadein_result").innerHTML = "0" + " sec";
    document.getElementById("fadein").style.background = " linear-gradient(to right, rgb(0 255 102) 0%, #19d7a5 0%, black 0%, black 100%)";

    document.getElementById("fadeout").value = 0;
    document.getElementById("fadeout_result").innerHTML = "0"+ " sec";
    document.getElementById("fadeout").style.background = " linear-gradient(to right, rgb(0 255 102) 0%, #19d7a5 0%, black 0%, black 100%)";

}

// gets info and update a specific audio file information
socket.on('update', function(info){
    decrypted =  CryptoJS.AES.decrypt(info, key ,{mode:CryptoJS.mode.ECB});
    info = decrypted.toString(CryptoJS.enc.Utf8);

    if(info.split(";")[5] == "true"){
        id = info.split(";")[0];
    
        created = true;
    
        lastclicked = id;    
    
        var time = parseInt(info.split(";")[4]);
        var minutes = Math.floor(time/60);
        var seconds = time - minutes*60;
    
        if(seconds < 10){
            str = minutes + ":0" + seconds;
        }
        else{
            str = minutes + ":" + seconds;
        }
        var p= info.split(";")[2]
        
        for(var i=0;i<info.split(";")[2].split("\\").length;i++){
            p = p.replace("\\","/")
        }
    
        var originalpath = p.replace(p.split("/")[p.split("/").length-1],"")
        var anotheroriginal = ""
        var anotheredited = ""
    
        var name = info.split(";")[1]
    
        editedpath = info.split(";")[3]
    
        if(originalpath.length > 18){
            anotheroriginal = originalpath.substring(0,18) + "...continue"
        }
        else{
            anotheroriginal = originalpath + "original file"
        }
    
        if(editedpath.length > 18){
            anotheredited = info.split(";")[3].substring(0,18) + "...continue"
        }
        else{
            anotheredited = info.split(";")[3] + "edited file"
        }
    
        if(name.length > 30){
            name = name.substring(0,30) + "...continue"
        }
    
        document.getElementById("name" + id).innerHTML = name;
        document.getElementById("origin" + id).innerHTML = anotheroriginal
        document.getElementById("edited" + id).innerHTML = anotheredited
        document.getElementById("time" + id).innerHTML = str
    
        lastname =  document.getElementById("name").value;
        var path = document.getElementById("edited"+lastclicked).innerHTML
    
        if(document.getElementById("edited"+lastclicked).innerHTML[0] == " "){
            document.getElementById("edited").value = path.replace(path.split("/")[path.split("/").length-1],"").substring(1)
        }
        else{
            document.getElementById("edited").value = path.replace(path.split("/")[path.split("/").length-1],"")
        }
        lastpath = document.getElementById("edited").value;
        document.getElementById("origin" + id).title = originalpath + "original file";
        document.getElementById("edited" + id).title = info.split(";")[3] + "edited file";
        document.getElementById("name" + id).title = info.split(";")[1];
        
        document.getElementById("name").value = document.getElementById("name"+lastclicked).title;
    
        document.getElementById("specsloader").style.display = "none";
    }
    else{
        Remove();
        document.getElementById("specsloader").style.display = "none";
    }
});

// gets str and set the audio file's tabs of the user
socket.on('getinfo', function(str)
{
    decrypted =  CryptoJS.AES.decrypt(str, key ,{mode:CryptoJS.mode.ECB});
    str  = decrypted.toString(CryptoJS.enc.Utf8);
    username = str.split("`")[0];
    sessionStorage.setItem("user", username);
    songs = str.split("`")[1].split("+")
    document.getElementById("username").innerHTML = username;
    if(songs.length == 2){
        CreateDiv([lastid + 1,"","",""],i,false);
        position = 1;
        newexist = true;
        created = false;
    }
    else{
        for(var i=0 ;i<songs.length-2   ;i++){
            CreateDiv (songs[i].split(","),i, true);
        }
        lastclicked = parseInt(songs[0].split(",")[0])
        position = i;

        document.getElementById("waveloader").style.display  = "block"
        SetSpecs(songs[0].split(","));
    }
});

// gets information about an audio file, poition and if its already exist and created a new audio file tab
function CreateDiv(specs, pos, exist){
    var tab = document.createElement("div");
    tab.classList.add("songtab");
    tab.setAttribute("id","tab-"+specs[0]);

    lastid = parseInt(specs[0]);

    var str = ""

    tab.onclick = function(){
        if(ready && created && lastclicked != parseInt(specs[0])){
            lastclicked = parseInt(specs[0]);
            document.getElementById("waveloader").style.display  = "block";
            if(document.getElementById("origin"+lastclicked) == "Unknown"){
                Remove();
                newexist = true;
            }
            else{
                wavesurfer.empty();
                var encrypted = CryptoJS.AES.encrypt(username + "/" + lastclicked, key, {mode: CryptoJS.mode.ECB});
                encrypted =encrypted.toString();

                socket.emit("getspecs",encrypted)
            }
        }
    }

    if(specs[4] != ""){
        var time = parseInt(specs[4])
        var minutes = Math.floor(time/60)
        var seconds = time - minutes*60
        if(seconds < 10){
            str = minutes + ":0" + seconds
        }
        else{
            str = minutes + ":" + seconds
        }
    }
    if (exist){
        // var originalpath = p.replace(p.split('\\')[p.split('\\').length-1],"")
        var p = specs[2].replace('"',"").replace("\\","/")
        var originalpath = p.replace(p.split("/")[p.split("/").length-1],"")
        var editedpath =  specs[3].replace(specs[3].split("/")[specs[3].split("/").length-1],"")

        var anotheroriginal = ""
        var anotheredited = ""

        if(originalpath.length > 18){
            anotheroriginal = originalpath.substring(0,18) + "...continue"
        }
        else{
            anotheroriginal = originalpath + "original file"
        }

        if(editedpath.length > 18){
            anotheredited = editedpath.substring(0,18) + "...continue"
        }
        else{
            anotheredited = editedpath + "edited file"
        }

        var name = specs[1].replace("'","").replace("'","");

        if(name.length > 30){
            name = name.substring(0,30) + "...continue"
        }
    
        tab.innerHTML = "<div class='specs'>name: <span id='name"+ specs[0] +"' style='color:#3f51b5' title='"+specs[1].replace("'","").replace("'","")+"'>"+name+"</span></div>\
        <div class='specs'>Original File path: <span id='origin"+ specs[0] +"' title='"+originalpath.replace("'","")+"original file' style = 'color:#3f51b5;text-align-last:right'>"+anotheroriginal.replace("'","")+"</span></div>\
        <div class='specs'>Edited File path: <span id='edited"+ specs[0] +"' title='"+editedpath.replace("'","")+"edited file' style = 'color:#3f51b5'>"+anotheredited.replace("'","")+"</span></div>\
        <div class='specs'>time: <span id='time"+ specs[0] +"' style = 'color:#3f51b5'>"+str+"</span></div>\
        <button class='tabbutton' onclick='Play()'></button>";
    
    }
    else{
        tab.innerHTML = "<div class='specs'>name: <span id='name"+ specs[0] +"' style='color:#3f51b5'>Unknown</span></div>\
        \n<div class='specs'>Original File path: <span id='origin"+ specs[0] +"' style = 'color:#3f51b5'>Unknown</span></div>\
        \n<div class='specs'>Edited File path: <span id='edited"+ specs[0] +"' style = 'color:#3f51b5'>Unknown</span></div>\
        \n<div class='specs'>time: <span id='time"+ specs[0] +"' style = 'color:#3f51b5'>Unknown</span></div>\
        \n<button class='tabbutton' onclick='Play()'></button>";

    }
    
    // var time = parseInt(specs[4])
    // var minutes = Math.floor(time/60)
    // var seconds = time - minutes*60

    tab.style.top = (152*pos) + "px";

    list.append(tab);
}

//gets called and sends to the sever the string in the search input text
function Magnify(){
    var filename = document.getElementById("search").value;
    if(position == 0){
        document.getElementById("waveloader").style.display  = "none"
    }
    else{
        document.getElementById("waveloader").style.display  = "block"
    }

    var encrypted = CryptoJS.AES.encrypt(username + "/" + filename, key, {mode: CryptoJS.mode.ECB});
    encrypted =encrypted.toString();

    socket.emit("filelist", encrypted)
}

// gets str and set the audio file's tabs of the user
socket.on('showsongs', function(str){
    decrypted =  CryptoJS.AES.decrypt(str, key ,{mode:CryptoJS.mode.ECB});

    str = decrypted.toString(CryptoJS.enc.Utf8);
    document.getElementById("list").innerHTML = ""
    Remove();
    songs = str.split("`")[1].split("+")
    document.getElementById("username").innerHTML = username;
    if(songs.length == 1     && alldelete){
        CreateDiv([1,"","",""],i,false)
        position = 1;
        newexist = true;
    }
    else if(songs.length == 1 && !alldelete){
        filename = document.getElementById("search").value = ""

        Magnify()
    }
    else{
        for(var i=0 ;i<songs.length-1;i++){
            CreateDiv (songs[i].split(","),i, true);
        }
        lastclicked = parseInt(songs[0].split(",")[0])
        position = i;
        SetSpecs(songs[0].split(","));
    }
    created = true;
})

//gets a big array of numbers and load it to the wavesurfer as an audio file
socket.on('loadfile', function(file){
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert("does not support AudioContext");
        }
            window.AudioContext = window.webkitAudioContext;
    }
    context = new AudioContext();
    var arrayBuffer = new ArrayBuffer(file.length);
    var bufferView = new Uint8Array(arrayBuffer);
    for (i = 0; i < file.length; i++) {
        bufferView[i] = file[i];
    }
    context.decodeAudioData(arrayBuffer, function(buffer) {
        buf = buffer;
        var source = context.createBufferSource();
        source.buffer = buf;
        source.connect(context.destination);
        alreadySaved = true;
        ready = false;
        document.getElementById("waveloader").style.display  = "block"
        wavesurfer.loadDecodedBuffer(source.buffer);
    });
});

// gets information about an audio file and sends it to SetSpecs
socket.on('transfer', function(specs){
    SetSpecs(specs)
})

//gets information about an audio file and sets its values into curtain elements and to the audio file's tab
function SetSpecs(specs){
    if(isPlaying){
        var btn = $(".button");
        btn.toggleClass("paused");
        wavesurfer.pause();
        isPlaying = !isPlaying;
    }

    ChangeSurfer(specs[2].replace("'","").replace("'",""));

    document.getElementById("vol").value = specs[5].substring(1);
    document.getElementById("speed").value = specs[8].substring(1);
    document.getElementById("fadein").value = specs[6].substring(1);
    document.getElementById("fadeout").value = specs[7].substring(1);
    document.getElementById("leftsec").value = parseInt(specs[9].substring(1));
    document.getElementById("rightsec").value = parseInt(specs[10].substring(1));
    if(document.getElementById("name"+lastclicked).title[0] == " "){document.getElementById("name").value = document.getElementById("name"+lastclicked).title.substring(1);}

    else{document.getElementById("name").value = document.getElementById("name"+lastclicked).title;}

    var path = $('#edited'+lastclicked).attr('title')
    path = path.replace(path.split("/")[path.split("/").length-1],"")

    if(path[0] == " "){document.getElementById("edited").value = path.substring(1)}

    else{document.getElementById("edited").value = path;}

    lastname = document.getElementById("name").value;
    lastpath = document.getElementById("edited").value;

    fadeboundry = (document.getElementById("rightsec").value - document.getElementById("leftsec").value)/2;

    //changing the color of the volume's bar 
    var value = (vol.value-vol.min)/(vol.max-vol.min)*100
    vol.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';
    //side value changes
    document.getElementById("vol_result").innerHTML = vol.value + "%";

    //change the volume on the soundwave
    lastVolVal += ((vol.value)/100-lastVolVal);

    wavesurfer.setVolume(lastVolVal);

    ratiofadein = lastVolVal/fin.value;
    ratiofadeout = lastVolVal/fout.value;


    var value = (speed.value-speed.min)/(speed.max-speed.min)*100
    speed.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';
    //side value changes
    document.getElementById("speed_result").innerHTML = speed.value  + "x";
    
    //change the volume on the soundwave
    wavesurfer.setPlaybackRate(speed.value);
    

    //changing the color of the speed's bar 
    var value = (fin.value-fin.min)/(fin.max-fin.min)*100
    //side value changes
    document.getElementById("fadein_result").innerHTML = fin.value + " sec";
        
    if(fadeboundry < fin.value){
        fin.value = fadeboundry;
        document.getElementById("fadein_result").innerHTML = fadeboundry + " sec";
        stop1 = true;
        value = (fadeboundry-fin.min)/(fin.max-fin.min)*100
        fadeinval = fadeboundry;
    }
    else{
        stop1 = false;
        fadeinval = this.value;

    }
    fin.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';

    ratiofadein = lastVolVal/fin.value;

    
    //changing the color of the speed's bar 
    var value = (fout.value-fout.min)/(fout.max-fout.min)*100
    //side value changes
    document.getElementById("fadeout_result").innerHTML = fout.value+ " sec";

    if(fadeboundry < fout.value){
        fout.value = fadeboundry;
        document.getElementById("fadeout_result").innerHTML = fadeboundry+ " sec";
        stop2 = true;
        value = (fadeboundry-fout.min)/(fout.max-fout.min)*100
        fadeoutval = fadeboundry;
    }
    else{
        stop2 = false;
        fadeoutval = fout.value;
    }
    fout.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';

    ratiofadeout = lastVolVal/fout.value;
    
}

var timeout = setTimeout(1)

//gets information and changes the name and the edited audio file path according to the data
socket.on("setab",function(data){
    var result = "";

    document.getElementById("specsloader").style.display = "none";
    decrypted =  CryptoJS.AES.decrypt(data, key ,{mode:CryptoJS.mode.ECB});
    data = decrypted.toString(CryptoJS.enc.Utf8);

    if(data.split(";")[0].split(",")[0] == true || data.split(";")[0].split(",")[0] == "true"){
        p = data.split(";")[0].split(",")[1];
        for(var i=0;i<data.split(";")[0].split(",")[1].split("\\").length;i++){
            p = p.replace("\\","/");
        } 
        var anotheredited = p.replace(p.split("/")[p.split("/").length-1],"");

        editedpath = document.getElementById("edited").value;
        
        lengthh = editpath.split("\\").length

        for(var i=0;i<lengthh;i++){
            editedpath = editpath.replace("\\","/")
        }

        if(editedpath[editedpath.length-1] == "/"){
            editedpath = editedpath.substring(0,editedpath.length-1)
        }

        var anotheredited = "";
        if(editedpath.length > 18){
            anotheredited = editedpath.substring(0,18) + "...continue";
        }
        else{
            anotheredited = editedpath + "/edited file";
        }
        
        document.getElementById("edited" + lastclicked).title = editedpath + "/edited file";
        document.getElementById("edited"+lastclicked).innerHTML = anotheredited;

    }
    else{
        result = "didnt save the changes to the path"

        document.getElementById("result").style.left = "1021px"
    }

    if(data.split(";")[1].split(",")[0] == "true"){
        var name =  data.split(";")[1].split(",")[1];

        if(name.length > 30){
            name = name.substring(0,30)+"...continue";
        }

        document.getElementById("name"+lastclicked).innerHTML = name;
        document.getElementById("name"+lastclicked).title = document.getElementById("name").value;
    }

    else{
        if(result.length == 0){
            result = "didnt save the changes to the name"
            document.getElementById("result").style.left = "1021px"

        }
        else{
            result = "didnt save the changes to the path and the name"
            document.getElementById("result").style.left = "956px"

        }
    }

    if(result.length != 0){
        clearTimeout(timeout);
        $("#result").show();
        document.getElementById("result").innerHTML = result;
        timeout = setTimeout(function() { $("#result").hide(); }, 4000);
    }
})

// gets an id and sets the lastclicked value
function UpdateClicked(id){
    lastclicked = parseInt(id);
}

// checks if the page was reloaded and call the server accordingly
function GetUsername(){
    if(pageAccessedByReload){
        socket.emit("change", sessionStorage.getItem("user"));
    }

    socket.emit("username");
}

// play/stop button of an audio file
var isPlaying = false
$(document).ready(function() {
    // pause/play button
    var btn = $(".button");
    btn.click(function() {
        isPlaying = !isPlaying;
        btn.toggleClass("paused");
        if(wavesurfer.getCurrentTime()/ratio >= getOffset(cropright).left - (border1+15) || wavesurfer.getCurrentTime()/ratio <= (getOffset(cropleft).left - (length+5))){
            wavesurfer.play((getOffset(cropleft).left - (length+5))*ratio);
        }
        return false;
    });
});

// play/stop with spacebar of an audio file on a curtain condition
document.body.onkeyup = function(e){
    if(e.keyCode == 32 && !inputed){
        var btn = $(".button");
        isPlaying = !isPlaying;
        btn.toggleClass("paused");
        if(wavesurfer.getCurrentTime()/ratio >= getOffset(cropright).left - (border1+15) || wavesurfer.getCurrentTime()/ratio <= (getOffset(cropleft).left - (length+5))){
            wavesurfer.play((getOffset(cropleft).left - (length+5))*ratio);
        }
        if(!isPlaying){
            wavesurfer.pause();
        }
        else{
            wavesurfer.play();
        }
        return false;
    }
}

// changes the play button form
wavesurfer.on('finish', function () {
    var btn = $(".button");
    btn.toggleClass("paused");
});

// creates a new uninserted tab
document.getElementById("plus").addEventListener("click", function(){
    if(!newexist && ready && created){
        Remove();
        CreateDiv([lastid + 1,"","",""],position,false)
        position = position+1;
        newexist = true;
    }
})

var inputed = false

// changes the inputed value acoordingly
function changeVar(value){
    if(value == "click"){
        inputed = true;
    }
    else {inputed = false}
}

document.getElementById("edited").addEventListener('click', function(){changeVar("click")}) 
document.getElementById("edited").addEventListener('blur', function(){changeVar("blur")})

document.getElementById("name").addEventListener('click', function(){changeVar("click")}) 
document.getElementById("name").addEventListener('blur', function(){changeVar("blur")})

document.getElementById("search").addEventListener('click', function(){changeVar("click")}) 
document.getElementById("search").addEventListener('blur', function(){changeVar("blur")})

var vol = document.getElementById("vol");
var lastVolVal = 1;
vol.oninput = UpdateVol;
vol.onchange = UpdateVol;

// changes the volume bar css and value
function UpdateVol() {
    //changing the color of the volume's bar 
    var value = (this.value-this.min)/(this.max-this.min)*100
    this.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';
    //side value changes
    document.getElementById("vol_result").innerHTML = this.value + "%";

    //change the volume on the soundwave
    lastVolVal += ((this.value)/100-lastVolVal);

    wavesurfer.setVolume(lastVolVal);

    ratiofadein = lastVolVal/fin.value;
    ratiofadeout = lastVolVal/fout.value;

};

// changes the speed bar css and value
var speed = document.getElementById("speed");
speed.oninput = function() {
    //changing the color of the speed's bar 
    var value = (this.value-this.min)/(this.max-this.min)*100
    this.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';
    //side value changes
    document.getElementById("speed_result").innerHTML = this.value + "x";

    //change the volume on the soundwave
    wavesurfer.setPlaybackRate(this.value);;

    //bringing up or down the volume of the audio file
    // socket.emit('speededit', this.value);
};

// changes the fade in bar css and value
var fadeinval = 0
var stop1 = false;
var fin = document.getElementById("fadein");
fin.oninput = function() {
    //changing the color of the speed's bar 
    var value = (this.value-this.min)/(this.max-this.min)*100
    //side value changes
    document.getElementById("fadein_result").innerHTML = this.value + " sec";

    if(fadeboundry < this.value){
        fin.value = fadeboundry;
        document.getElementById("fadein_result").innerHTML = fadeboundry + " sec";
        stop1 = true;
        value = (fadeboundry-this.min)/(this.max-this.min)*100
        fadeinval = fadeboundry;
    }
    else{
        stop1 = false;
        fadeinval = this.value;

    }

    this.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';

    ratiofadein = lastVolVal/this.value;


};

// changes the fade out bar css and value
var stop2 = false;
var fadeoutval = 0
var fout = document.getElementById("fadeout");
fout.oninput = function() {
    //changing the color of the speed's bar 
    var value = (this.value-this.min)/(this.max-this.min)*100
    //side value changes
    document.getElementById("fadeout_result").innerHTML = this.value+ " sec";


    if(fadeboundry < this.value){
        fout.value = fadeboundry;
        document.getElementById("fadeout_result").innerHTML = fadeboundry+ " sec";
        stop2 = true;
        value = (fadeboundry-this.min)/(this.max-this.min)*100
        fadeoutval = fadeboundry;
    }
    else{
        stop2 = false;
        fadeoutval = this.value;
    }
    this.style.background = 'linear-gradient(to right,  rgb(0 255 102) 0%,  #19d7a5 '+ value +'%, black ' + value + '%, black 100%)';



    ratiofadeout = lastVolVal/this.value;

};


const cropright = document.getElementById("crop_right");
const cropleft = document.getElementById("crop_left");

//skip the audio file forward by 5 second
function SkipForwards(){
    if(ready){
        if(wavesurfer.getCurrentTime() + 5 < (getOffset(cropright).left - (border1+10))*ratio){
            wavesurfer.skip(5);
        }
        else{
            wavesurfer.seekTo(((getOffset(cropright).left - (border1+10))*ratio)/duration);
        }
    }
}

//skip the audio file backwards by 5 second
function SkipBackwards(){
    if(ready){
        if(wavesurfer.getCurrentTime() - 5 > ((getOffset(cropleft).left - (length+5)))*ratio){
            wavesurfer.skip(-5);
        }
        else{
            wavesurfer.seekTo((((getOffset(cropleft).left - (length+5)))*ratio)/duration);
        }
    }
}

//gets the audio file to its starter point
function Restart(){
    if(ready){
        wavesurfer.play((getOffset(cropleft).left - (length+5))*ratio);
        if(!isPlaying){
            var btn = $(".button");
            btn.toggleClass("paused");
            isPlaying = true;
        }
    }
}

// reset the crop right and crop left elements to their original positions
function CropRestart(){
    if(ready){
        cropleft.style.left = border1 + "px";
        cropright.style.left = border2 + "px";
        document.getElementById("leftsec").value = 0;
        document.getElementById("rightsec").value = duration.toFixed(3);
        ratio = duration/portion;
        currentduration = wavesurfer.getDuration();
        fadeboundry = Math.floor(currentduration/2);
    }
}



var right_clicked = false;
var left_clicked = false;

cropleft.addEventListener("mousedown", mousedown2);

cropright.addEventListener("mousedown", mousedown);

// function the gets whole the positions of every elemnts
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

// changes the crop right position to where the user wants with a mouse
function mousedown(event){
    //triggered if the mouse is on the crop right object
    window.addEventListener("mousemove", mousemove);
    //triggered if the mouse is not on the crop right object anymore
    window.addEventListener("mouseup", mouseup)

    let prevX = event.clientX;
    const posY = event.clientY;

    function mousemove(e){
        right_clicked = true; 
        //checks if the crop right object crossed the right border and move it if necessary
        if(getOffset(cropright).left > border2){
            cropright.style.left = border2 + "px";
            cropright.style.left = Math.floor(cropright.style.left); 
        }
        // checks if the crop right object is 80 px aways from the crop right object and move it if necessary
        else if((getOffset(cropright).left - (border1+10)) < (getOffset(cropleft).left - (length+5)) + 60){
            cropright.style.left = (getOffset(cropleft).left) + 80 + "px";
        }
        //checks if the audio got to the crop right position and stop it
        if(getOffset(cropright).left - (border1+10) <= wavesurfer.getCurrentTime()/ratio){
            wavesurfer.seekTo((getOffset(cropright).left - (border1+10))*ratio/duration); 
            if(wavesurfer.isPlaying()){
                wavesurfer.pause();
                var btn = $(".button");
                btn.toggleClass("paused");
            }
            // wavesurfer.setPlayEnd((getOffset(cropright).left - (border1+10))*ratio/duration);
        }
        //moves the crop right object if its valid
        if(getOffset(cropright).left <= border2 &&  (getOffset(cropright).left - (border1+10)) >= (getOffset(cropleft).left - (length+5)) + 60){
            let newX = prevX - e.clientX;

            const now = cropright.getBoundingClientRect();

            cropright.style.left = now.left - newX + "px";

            prevX = e.clientX;
        }
        //checks if the crop right object crossed the right border and move it if necessary
        if(getOffset(cropright).left - (border1+10) < wavesurfer.getCurrentTime()/ratio){
            wavesurfer.seekTo((getOffset(cropright).left - (border1+10))*ratio/duration); 
        }
        document.getElementById("rightsec").value = ((getOffset(cropright).left - (border1+10))*ratio).toFixed(3);
        currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
        fadeboundry = Math.floor(currentduration/2);
    }
    //remove listening events if mouse is removed from the crop right object 
    function mouseup(e){
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup)
        right_clicked = false;
    }
}

var length = 590;

// changes the crop lest position to where the user wants with a mouse
function mousedown2(event){

    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup)

    let prevX = event.clientX;
    const posY = event.clientY;

    function mousemove(e){
        left_clicked = true;
        // console.log(getOffset(cropleft).left);
        if(getOffset(cropleft).left < border1){
            cropleft.style.left = border1 + "px";
            cropleft.style.left = Math.floor(cropleft.style.left); 
        }
        else if((getOffset(cropright).left - (border1+10)) < (getOffset(cropleft).left - (length+5)) + 60){
            cropleft.style.left = (getOffset(cropright).left) - 80 + "px";
        }
        // if(getOffset(cropleft).left - length > wavesurfer.getCurrentTime()/ratio){
        //     wavesurfer.seekTo((getOffset(cropleft).left - length)*ratio/duration); 
        // }
        if(getOffset(cropleft).left >= border1 && (getOffset(cropleft).left - (length+5)) <=  (getOffset(cropright).left - (border1+10)) - 60){
            let newX = prevX - e.clientX;

            const now = cropleft.getBoundingClientRect();
        
            cropleft.style.left = now.left - newX + "px";

            prevX = e.clientX;
            // leftpos = e.clientX;
            // ratio = duration/portion
            // console.log("cropleft = " + ((getOffset(cropleft).left - (length+5))*ratio));
            // console.log("place = " + Math.floor(wavesurfer.getCurrentTime()/ratio));
            // console.log("min = " + wavesurfer.getCurrentTime()/duration);
        }
        if(getOffset(cropleft).left -(length+5) >wavesurfer.getCurrentTime()/ratio){
            wavesurfer.seekTo((getOffset(cropleft).left - length)*ratio/duration);
        }
        if(((getOffset(cropleft).left - (border1+15))*ratio) >= 0){
            document.getElementById("leftsec").value = ((getOffset(cropleft).left - (border1+15))*ratio).toFixed(3);
        }
        console.log("cropleft = " + ((getOffset(cropleft).left - (length+5))));
        console.log("place = " + Math.floor(wavesurfer.getCurrentTime()));
        currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
        fadeboundry = Math.floor(currentduration/2);

    }

    function mouseup(e){
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
        left_clicked = false;
    }
}

// goes to a curtaine positions in the audio file that the user clicked
wavesurfer.on('seek', function () { 
    if(!right_clicked && !left_clicked){

        right_clicked = true
        if(Math.floor(wavesurfer.getCurrentTime()/ratio) > getOffset(cropright).left - (border1+10) || Math.floor(wavesurfer.getCurrentTime()/ratio) < getOffset(cropleft).left - (length+5)){
            console.log((getOffset(cropleft).left - length)*ratio/duration);
            console.log((getOffset(cropright).left - (border1+18))*ratio/duration);
            wavesurfer.play((getOffset(cropleft).left - (length+5))*ratio);
            var btn = $(".button");
            if(!isPlaying){
                btn.toggleClass("paused");
                isPlaying = true;
            }
        }
    }
    right_clicked = false;
});

// check at all time if the audio needs to stop, do fade in and fade out
wavesurfer.on('audioprocess', function () {
    if(wavesurfer.getCurrentTime()/ratio >= getOffset(cropright).left - (border1+10)){
        wavesurfer.seekTo((((getOffset(cropright).left - (border1+10))*ratio)/duration)); 
        wavesurfer.pause();
        isPlaying = false;
        var btn = $(".button");
        btn.toggleClass("paused");
    }
    //fade in and out check and setting the volume if the current time is in one of their fields
    // console.log(wavesurfer.getCurrentTime());
    // console.log((getOffset(cropleft).left - (length+5))*ratio);

    if(wavesurfer.getCurrentTime() - (getOffset(cropleft).left - (length+5))*ratio <= fin.value){
        console.log(((wavesurfer.getCurrentTime()-  (getOffset(cropleft).left - (length+5))*ratio)*ratiofadein));
        wavesurfer.setVolume(((wavesurfer.getCurrentTime() - (getOffset(cropleft).left - (length+5))*ratio)*ratiofadein))
    }

    // console.log((currentduration - (wavesurfer.getCurrentTime() - (getOffset(cropleft).left - (length+5))*ratio)));
    else if((getOffset(cropright).left - (border1+10))*ratio - wavesurfer.getCurrentTime() <= fout.value){
        console.log("x = "+ (((getOffset(cropright).left - (border1+10))*ratio - wavesurfer.getCurrentTime())*-ratiofadeout))
        console.log("y = " + (getOffset(cropright).left - (border1+10))*ratio - wavesurfer.getCurrentTime())
        wavesurfer.setVolume(((getOffset(cropright).left - (border1+10))*ratio - wavesurfer.getCurrentTime())*-ratiofadeout + (lastVolVal/50))
    }

    else{
        wavesurfer.setVolume(lastVolVal);
    }
});

// collects all the info about an audio file and sends it to the server 
function Save(){
    editpath = document.getElementById("edited").value
    lengthh = editpath.split("\\").length
    for(var i=0;i<lengthh;i++){
        editpath = editpath.replace("\\","/")
    }
    if(editpath[editpath.length-1] != "/"){editpath+="/"}
    console.log((getOffset(cropleft).left - (length+5))*ratio);
    console.log((getOffset(cropright).left - (border1+10))*ratio);
    var data = vol.value + "/" + speed.value + "/" + document.getElementById("leftsec").value + "," + document.getElementById("rightsec").value  + "/" + fin.value + "," + fout.value + "/" +username + "/" + lastclicked + ";" + document.getElementById("name").value+ ";" + editpath;

    var encrypted = CryptoJS.AES.encrypt(data, key, {mode: CryptoJS.mode.ECB});
    encrypted =encrypted.toString();

    document.getElementById("specsloader").style.display = "block";
    

    socket.emit('saveaudio', encrypted);
}


// changes the crop right position to where the user wants with a button
function moveRight(bool){
    var value =  parseInt(document.getElementById("rightsec").value);
    if(bool){
        document.getElementById("rightsec").value = value + 1;
    }
    else{
        document.getElementById("rightsec").value = value - 1;
    }
    CorrectingRight();
}

//corrects the position of the crop left so it want cross the borders it was set in
function Correctingleft(){
    var value = parseFloat(document.getElementById("leftsec").value);
    if(parseFloat(document.getElementById("leftsec").value) < 0){
        document.getElementById("leftsec").value = 0;
        cropleft.style.left = border1 + "px"
    }
    
    if(value < ((getOffset(cropright).left - (border1+10) - 80)*ratio)  && (getOffset(cropleft).left - length)*ratio > 0){
        // document.getElementById("leftsec").value =((getOffset(cropright).left - (border1+10) - 60)*ratio).toFixed(3);
        cropleft.style.left = (value/ratio + border1)  + "px"
    }
    if(value > wavesurfer.getCurrentTime()){
        wavesurfer.seekTo(((getOffset(cropleft).left - (length+5))*ratio)/duration);
    }
    currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
    fadeboundry = Math.floor(currentduration/2);
}

// changes the crop left position to where the user wants with a button
function moveLeft(bool){
    var value =  parseInt(document.getElementById("leftsec").value);
    if(bool){
        document.getElementById("leftsec").value = value + 1;
    }
    else{
        document.getElementById("leftsec").value = value - 1;
    }
    Correctingleft();
}

// changes the crop left position to where the user wants with text of number
$('#leftsec').on('input', function() {
    var value = parseFloat(document.getElementById("leftsec").value);
    if(parseFloat(document.getElementById("leftsec").value) < 0){
        document.getElementById("leftsec").value = 0;
        cropleft.style.left = border1 + "px"
    }
    
    if(value < ((getOffset(cropright).left - (border1+10) - 80)*ratio)  && (getOffset(cropleft).left - (length+5))*ratio > 0){
        // document.getElementById("leftsec").value =((getOffset(cropright).left - (border1+10) - 60)*ratio).toFixed(3);
        cropleft.style.left = (value/ratio + border1)  + "px"
    }
    if(value > wavesurfer.getCurrentTime()){
        wavesurfer.seekTo(((getOffset(cropleft).left - (length+5))*ratio)/duration);
    }
    currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
    fadeboundry = Math.floor(currentduration/2);
});

//corrects the position of the crop right so it want cross the borders it was set in
function CorrectingRight(){
    var value = parseFloat(document.getElementById("rightsec").value);
    if(parseFloat(document.getElementById("rightsec").value) > wavesurfer.getDuration()){
        document.getElementById("rightsec").value = wavesurfer.getDuration().toFixed(3);
        cropright.style.left = (wavesurfer.getDuration()/ratio + border1)  + "px"
    }

    if(value > (((getOffset(cropleft).left - (length+5)) + 80)*ratio)){
        cropright.style.left = (value/ratio + border1)  + "px"
    }
    currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
    fadeboundry = Math.floor(currentduration/2);
}

// changes the crop right position to where the user wants with text of number
$('#rightsec').on('input', function() {
    var value = parseFloat(document.getElementById("rightsec").value);
    if(parseFloat(document.getElementById("rightsec").value) > wavesurfer.getDuration()){
        document.getElementById("rightsec").value = wavesurfer.getDuration().toFixed(3);
        cropright.style.left = (wavesurfer.getDuration()/ratio + border1)  + "px"
    }

    else if(value > (((getOffset(cropleft).left - (length+5)) + 80)*ratio)){
        cropright.style.left = (value/ratio + border1)  + "px"
    }
    currentduration = (getOffset(cropright).left - (border1+10))*ratio - (getOffset(cropleft).left - (length+5))*ratio;
    fadeboundry = Math.floor(currentduration/2);
});  

//gets calls and transfer the client to the Sign in window
function ToSignIn(){
    window.location.replace("http://127.0.0.1:5000/log_in")
}

//changes the var value of play ready
function Play(){
    playready = true;
}

//gets calls and transfer the client to the info window
function ToInfo(){
    socket.emit("change", username)
    window.location.replace("http://127.0.0.1:5000/intro")
}
