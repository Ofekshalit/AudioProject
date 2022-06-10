from importlib.resources import path
from socket import socket
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from pydub import AudioSegment
import os
import pydub
from audio_settings import Files_settings
from clients import Users
import threading
import base64 
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad,unpad
from pathlib import Path, PureWindowsPath

mw = Flask(__name__)
socketio = SocketIO(mw)
mw.config['SECRET_KEY'] = 'secretive'

user_table = Users()
users = {}
key = 'AAAAAAAAAAAAAAAA'

#gives the user the html of a curtain page
@mw.route("/")
@mw.route("/sign_up", methods=["POST", "GET"])
def sign_up():
    return render_template('signup.html')

# @mw.route("/")
@mw.route("/log_in", methods=["POST", "GET"])
def log_in():
    print("users:")
    print(user_table.print())
    return render_template('login.html')
    
# @mw.route("/")
@mw.route("/MainWindow", methods=["POST", "GET"])
def home():
    return render_template('MainWindow.html')

@mw.route("/intro", methods=["POST", "GET"])
def inro():
    return render_template('intro.html')


audio_file = Files_settings()
vol_ratio = 0.3
id = 0
username = ""

#gets a string massage and return an encrypted massage
def encrypt(raw):
        raw = pad(raw.encode(),16)
        cipher = AES.new(key.encode('utf-8'), AES.MODE_ECB)
        return base64.b64encode(cipher.encrypt(raw))

#gets a encoded massage and return a decoded massage
def decrypt(enc):
        enc = base64.b64decode(enc)
        cipher = AES.new(key.encode('utf-8'), AES.MODE_ECB)
        return unpad(cipher.decrypt(enc),16)

#get a string that contains a password and a username and checks if the username exists
@socketio.on('checkin')
def check_user_exist(str):

    global username
    result =  user_table.check_user(str.split("/")[0], str.split("/")[1])

    if result:
        print(users)
        socketio.emit("valid", result, room=request.sid)
        username = str.split("/")[0]

    else:
        socketio.emit("valid", result, room= request.sid)


#get a string that contains a password and a username and checks if the username already exists in the clients db and if not the server will insert the username and the password to the db 
@socketio.on('checkup')
def check_username_exist(str):
    global username
    result =  user_table.check_username(str.split("/")[0])

    if result:
        print(users)
        user_table.insert_new_user(str.split("/")[0], str.split("/")[1])
        print("users:")
        print(user_table.print())
        username = str.split("/")[0]
        socketio.emit("correct", result, room= request.sid)

    else:
        socketio.emit("correct", result, room= request.sid)


#use the username that was saved for a second when a client just signed in\up and gets all the songs that the client have and send them to him
@socketio.on('username')
def get_username_info():
    global username
    print(users)
    list = user_table.print_user_songs(username)
    stri = username + "`" 
    for i in range(len(list)):
        print(str(list[i])[1:len(str(list[i]))-1] + "+")
        stri += str(list[i])[1:len(str(list[i]))-1] + "+"
    stri += "+"
    socketio.emit("getinfo", encrypt(stri.replace("\\","/")).decode("utf-8", "ignore"), room= request.sid)
    username = ""

#returns a save user
@socketio.on("getusername")
def get_name():
    global username
    
    socketio.emit("return", encrypt(username).decode("utf-8", "ignore"), room= request.sid)
    

@socketio.on("change")
def change_global_username(user):
    global username
    username = user

#gets a username and an id and send the specs of a song from the username's db that his id is equal to the id that was given
@socketio.on('getspecs')
def getsong(message):
    message = decrypt(message).decode("utf-8", "ignore")
    stri = str(user_table.get_user_song(message.split("/")[0],message.split("/")[1]))

    socketio.emit("transfer",stri[1:-1:].split(","), room=request.sid)


#gets a path and convert with os to a bytes array and sends to the js
@socketio.on('getfile')
def get_audio(path):
    path = decrypt(path).decode("utf-8", "ignore")
    file = open(os.path.normpath(path[1::]).replace('"',''), "rb")
    byte_array = list(file.read())
    if path.split(".")[len(path.split("."))-1] == "mp3":
        audio_file.set_audio_and_path(AudioSegment.from_file(path[1::]), path[1::])
        
    
    elif path.split(".")[len(path.split("."))-1] == "wav":
        audio_file.set_audio_and_path(AudioSegment.from_file(path[1::]), path[1::])
        
    socketio.emit('loadfile', byte_array, room=request.sid)


#2 threads that search the real path of a song in diffrent directories
def search1():
    global pathh
    global found
    for r,d,f in os.walk("C:\\"):
        if found == True:
            break
        for files in f:
            if files == os.path.split(pathh)[1]:
                pathh = os.path.join(r,files)
                found = True
                break

def search2():
    global pathh
    global found

    for r,d,f in os.walk("D:\\"):
        if found == True:
            break
        for files in f:
            if files == os.path.split(pathh)[1]:
                pathh = os.path.join(r,files)
                found = True   
                break  


#gets a username, a faked path and a song duration and search the real path of the client's song, insert the song to the client's songs db and sends to the js some of the song's specs
@socketio.on('create')
def audio_create(stri):
    stri = decrypt(stri).decode("utf-8", "ignore")
    global pathh
    global found

    pathh = stri.split("/")[0]
    username = stri.split("/")[1]
    found = False

    thread1 = threading.Thread(target=search1)
    thread2 = threading.Thread(target=search2)

    thread1.start()
    thread2.start()

    thread1.join()
    thread2.join()

    global audio_file

    if pathh.split(".")[len(pathh.split("."))-1] == "mp3":
        song = AudioSegment.from_file(Path(pathh))
        audio_file.set_audio_and_path(song, pathh)
        
    
    elif pathh.split(".")[len(pathh.split("."))-1] == "wav":
        audio_file.set_audio_and_path(AudioSegment.from_file(pathh), pathh)

    print("new file " + str(pathh))

    print(request.sid)

    name = pathh.split("\\")[len(pathh.split("\\")) -1].split(".")[0]

    massage = ""

    if not user_table.check_user_song_exist(username,name+"_edit"):
        massage = ";;;;;false"
    
    else:
        user_table.insert_user_song(username,name+"_edit",pathh, "C:/audio songs/", int(float(stri.split("/")[2])) ,100,0,0,1,0,float(stri.split("/")[2]))

        user_table.print_user_songs(username)

        type =  str(audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[1])

        audio_file.get_audio().export("C:/audio songs/" + name+ "_edit."+type, format=type)

        massage = str(user_table.get_id(username,name+"_edit")) + ";" + name +"_edit" + ";" + pathh + ";C:/audio songs/;" + str(int(float(stri.split("/")[2])))+";true"


    socketio.emit("update",encrypt(massage).decode("utf-8", "ignore"), room= request.sid)


#gets an username and a string and send a songs list thast their name starts with the specific string
@socketio.on("filelist")
def getfiles(data):
    data = decrypt(data).decode("utf-8", "ignore")

    stri = data.split("/")[0] + "`" 
    list = user_table.get_client_songs(data.split("/")[0],data.split("/")[1])

    for i in range(len(list)):
        print(str(list[i])[1:len(str(list[i]))-1] + "+")
        stri += str(list[i])[1:len(str(list[i]))-1] + "+"

    socketio.emit("showsongs", encrypt(stri.replace("\\","/")).decode("utf-8", "ignore"), room= request.sid)


#gets a username and an id and delets a song from the client's db
@socketio.on("deletesong")
def song_delete(data):

    data = decrypt(data).decode("utf-8", "ignore")
    user_table.delete_client_song(data.split("/")[0],data.split("/")[1])


#gets the specs from js about a specific file and saves it on the client's computer
@socketio.on('saveaudio')
def save(data):
    data = decrypt(data).decode("utf-8", "ignore")

    if os.path.isdir("C:\\audio songs") == False:
        os.mkdir("C:\\audio songs")

    massage = ""
    saved_path = ""
    name = ""

    last_name = user_table.get_user_song(str(data.split("/")[4]),str(data.split("/")[5].split(";")[0]))[1]

    last_edited_path = user_table.get_user_song(str(data.split("/")[4]),str(data.split("/")[5].split(";")[0]))[3]

    if os.path.isdir(data.split(";")[2]):
        saved_path = data.split(";")[2]
        massage = "true,"+saved_path+";"

    else:
        saved_path = last_edited_path
        massage = "false;"
    

    username = str(data.split("/")[4])

    print(audio_file.get_path())

    type =  str(audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[1])

    if os.path.isfile(saved_path+data.split(";")[1]+type) == False and user_table.check_user_song_exist(username, data.split(";")[1]):
        name = data.split(";")[1]

        if saved_path == last_edited_path:
            os.rename(last_edited_path + last_name +"."+ type,saved_path+name+"."+ type)
        massage += "true," + name

    else:
        name = last_name

        if data.split(";")[1] == last_name:
            massage += "true," + last_name

        else:
            massage += "false," + last_name


    print(saved_path+data.split(";")[1]+"."+type)
   
    print("volume boost of = " + str(data.split("/")[0]) + "l")
    print("new speed = " + str(data.split("/")[1]))
    print("start = " + str(data.split("/")[2].split(",")[0]))
    print("end = " + str(data.split("/")[2].split(",")[1]))

    audio_file.change_volume(data.split("/")[0])
    audio_file.crop(float(data.split("/")[2].split(",")[0]),float(data.split("/")[2].split(",")[1]))
    audio_file.change_speed(data.split("/")[1])
    audio_file.fadeinout(int(data.split("/")[3].split(",")[0]), int (data.split("/")[3].split(",")[1]))

    print(str(audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[1]))

    #                           id                      username name       path           |     edited path   |        volume    |    fade in                     |                fade out        |          speed    |       crop left                | crop right                              
    user_table.update_user_song(str(data.split("/")[5].split(";")[0]),username,name,audio_file.get_path(),saved_path,data.split("/")[0],data.split("/")[3].split(",")[0],data.split("/")[3].split(",")[1], data.split("/")[1],data.split("/")[2].split(",")[0],data.split("/")[2].split(",")[1])

    user_table.print_user_songs("john")

    # audio_file.get_audio().export("C:/audio songs/" + str((audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[0])) + "_edit.mp3", format=str(audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[1]))
    print(str(user_table.get_user_song(str(data.split("/")[4]),str(data.split("/")[5].split(";")[0]))))
    print(str((audio_file.get_path().split("\\")[len(audio_file.get_path().split("\\"))-1].split(".")[0])))
    audio_file.get_audio().export(saved_path+data.split(";")[1]+"."+type, format=type)
    audio_file.restoredef()

    socketio.emit("setab", encrypt(massage).decode("utf-8", "ignore"), room=request.sid)


if __name__ == "__main__":
    socketio.run(mw)