import sqlite3
from audio_settings import Files_settings
from songs import Songs


class Users:
    # creates the db and the varaibles in the class
    def __init__(self):
        self.conn = sqlite3.connect('users.db', check_same_thread=False)
        self.users = self.conn.cursor()
        self.users.execute("""CREATE TABLE IF NOT EXISTS users(
            username TEXT,
            password TEXT
        )""")


    # gets a username and a password and inserts them to the class
    def insert_new_user(self, username, password):
        self.users.execute(f"INSERT INTO users VALUES ('{username}','{password}')")
        self.conn.commit()

    # gets a username, name, path, editpath, time, volume , fadein, fadeout, speed, cropleft, cropright and call to the insert function of the username's songs db
    def insert_user_song(self, username, name, path, editpath, time, volume , fadein, fadeout, speed, cropleft, cropright):
        x = Songs(username)
        x.insert(name, path, editpath, time ,volume , fadein, fadeout, speed, cropleft, cropright)

    # gets a username, name, path, editpath, time, volume , fadein, fadeout, speed, cropleft, cropright and call to the update function of the username's songs db
    def update_user_song(self, id, username, name, path, editpath, volume , fadein, fadeout, speed, cropleft, cropright):
        Songs(username).update_song(id,name,path,editpath,volume,fadein,fadeout,speed,cropleft,cropright)


    #gets a username and a password and check if they exist on the same row
    def check_user(self, username, password):
        self.users.execute(f"""SELECT username,* FROM users WHERE username = '{username}' AND password = '{password}'""")

        return len(self.users.fetchall()) != 0

    #get a username and check if the username exists in the db
    def check_username(self, username):
        self.users.execute(f"""SELECT username,* FROM users WHERE username = '{username}'""")

        return len(self.users.fetchall()) == 0

    # return the whole clients in db
    def print(self):
        self.users.execute("SELECT * FROM users")
        users = self.users.fetchall()
        return users

    # gets an username and an id and call the get_song function of the username's songs db
    def get_user_song(self, username, id):
        # self.users.execute(f"""SELECT songs,* FROM users WHERE username = '{username}'""")
        return Songs(username).get_song(id)

    # gets an username and a name and calls the get_id function of the username's songs db
    def get_id(self, username, name):
        return Songs(username).get_id(name)

    # gets an username and a name and calls the check_song_exist function of the username's songs db
    def check_user_song_exist(self, username, name):
        return Songs(username).check_song_exist(name)

    # gets an username and calls the print function of the username's songs db
    def print_user_songs(self, username):
        return Songs(username).print()

    # gets an username and a name and calls the get_songs_name function of the username's songs db
    def get_client_songs(self,username,name):
        return Songs(username).get_songs_name(name)

    # gets an username and an id and call the delete( function of the username's songs db
    def delete_client_song(self,username,id):
        Songs(username).delete(id)



users = Users()

# users.remove_all()

# song = Files_settings()

# users.insert_new_user("ofek","shalit")

# users.insert_user_song("ofek", "RUMine", "C:/dame/scam.mp3", 150,12,12,1.5,30,150)

# users.insert_user_song("ofek", "RUMine", "C:/dame/scam.mp3", 150,12,12,1.5,30,150)

# users.insert_user_song("ofek", "RUMine", "C:/dame/scam.mp3", 150,12,12,1.5,30,150)

# print(users.print_user_songs("ofek"))
# print(str(users.print()))

# cursor.execute(f"SELECT rowid FROM users WHERE username = '{username}'")
#     id = cursor.fetchone()
#     id = ''.join(map(str, id))