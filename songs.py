import sqlite3
from audio_settings import Files_settings

class Songs:
    #creates the username's songs db and the self. variables
    def __init__(self, username):
        self.conn = sqlite3.connect(f"songs{username}.db")
        self.songs = self.conn.cursor()
        self.username = username
        self.songs.execute(f"""CREATE TABLE IF NOT EXISTS songs{self.username}(
            name TEXT,
            path TEXT,
            editpath TEXT,
            time INTEGER,
            volume INTEGER,
            fadein INTEGER,
            fadeout INTEGER,
            speed INTEGER,
            cropleft INTEGER,
            cropright INTEGER
        )""")

    # gets a name, path,editedpath ,time,volume , fadein, fadeout, speed, cropleft, cropright and insert them to the db
    def insert(self, name, path,editedpath ,time,volume , fadein, fadeout, speed, cropleft, cropright):
        self.songs.execute(f"INSERT INTO songs{self.username} VALUES (?,?,?,?,?,?,?,?,?,?)",(name,path,editedpath ,time, volume, fadein, fadeout,speed, cropleft, cropright))
        self.conn.commit()
        x = Songs("john")
        print(x.print())

    #gets a name and check if the name alreadt exists in the db
    def check_song_exist(self, name):
        self.songs.execute(f"""SELECT name,* FROM songs{self.username} WHERE name = '{name}'""")

        return len(self.songs.fetchall()) == 0

    # gets a id ,name, path,editedpath, volume , fadein, fadeout, speed, cropleft, cropright and updates the row where the id is found according to the vars that were given
    def update_song(self, id ,name, path,editedpath, volume , fadein, fadeout, speed, cropleft, cropright):
        self.songs.execute(f"""UPDATE songs{self.username} SET name =?,
        path =?,
        editpath =?, 
        volume =?,
        fadein =?, 
        fadeout =?,
        speed =?,
        cropleft =?,
        cropright =?
        WHERE rowid =?""",(name,path,editedpath , volume, fadein, fadeout,speed, cropleft, cropright, id))
        self.conn.commit()
        x = Songs("john")
        print(x.print())

    
    # gets a name and returns the id of the row were the name is found
    def get_id(self, name):
        self.songs.execute(f"""SELECT rowid,* FROM songs{self.username} WHERE name = '{name}'""")

        id= self.songs.fetchone()

        return id[0]

    #gets an id and returns the row were the id is found
    def get_song(self, id):
        self.songs.execute(f"""SELECT rowid,* FROM songs{self.username} WHERE rowid = '{id}'""")

        return self.songs.fetchone()

    # returns all the songs in the db
    def print(self):
        songs = ""
        self.songs.execute(f"SELECT rowid, * FROM songs{self.username}")
        list = self.songs.fetchall()
        return list

    # gets a name and returns all the songs that their name starts with the name that was given
    def get_songs_name(self,name):
        self.songs.execute(f"SELECT rowid,* FROM songs{self.username} WHERE name LIKE '%{name}%'")
        list = self.songs.fetchall()
        songs = ""

        return list

    # gets an id an delete the row were the id is found
    def delete(self, id):
        self.songs.execute(F"DELETE from songs{self.username} WHERE rowid = {id}")
        self.conn.commit()