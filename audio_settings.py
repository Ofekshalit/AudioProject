from flask_socketio import send
from pydub import audio_segment

class Files_settings:
    # creates the self. vars
    def __init__(self):
        self.volume_boost = 0
        self.audio = None
        self.speed = 0
        self.path = ""
        self.audio_original = None

    # gets an pydub class audio and a path and saves them and restart the volume boost to 0 
    def set_audio_and_path(self, audio, path):
        self.audio = audio
        self.volume_boost = 0
        self.path = path
        self.audio_original = audio

    # returns the path of an audio
    def get_path(self):
        return self.path

    #returns the volume boost of an audio
    def get_vol(self):
        return self.volume_boost

    # gets an int vol and boost the audio's volume according to the variable that was given
    def change_volume(self, vol):
        print(vol)
        newvol = float(vol)
        if newvol > 100:
            self.audio = self.audio_original + (newvol-100)*(1/20)
        elif newvol < 100:
            print(str((35 + (newvol-1)*(-35/99))))
            self.audio =  self.audio_original- (35 + (newvol-1)*(-35/99))

        return True
        # self.audio+= int(vol) - self.volume_boost
        # self.volume_boost = int(vol)

    # gets an int speed and saves it in the class and calls a function named speed change
    def change_speed(self, speed):
        self.speed = speed
        self.audio = speed_change(self.audio, self.speed)
        return True

    # gets a start and an end and cut the audio that is not between the start and the end
    def crop(self, start, end):
        self.audio = self.audio[start*1000:end*1000]

    # gets a misspelled in (due to technical issues) and an out makes a fade in and a fade out in the audio according to the variables that were given
    def fadeinout(self, een, out):
        if een != 0 and out != 0:
            self.audio = self.audio.fade_in(een*1000).fade_out(out *1000)
        
        elif een == 0 and out !=0:
            self.audio = self.audio.fade_out(out *1000)

        elif een != 0 and out == 0:
            self.audio = self.audio.fade_in(een *1000)

    # returns the audio
    def get_audio(self):
        return self.audio

    #restart the audio to his original specs
    def restoredef(self):
        self.audio = self.audio_original

#gets a pydub class variable named sound and a speed and makes the sound faster or slower according to the speed
def speed_change(sound, speed=1.0):
    # Manually override the frame_rate. This tells the computer how many
    # samples to play per second
    sound_with_altered_frame_rate = sound._spawn(sound.raw_data, overrides={
         "frame_rate": int(float(sound.frame_rate * float(speed)))
      })
     # convert the sound with altered frame rate to a standard frame rate
     # so that regular playback programs will work right. They often only
     # know how to play audio at standard frame rate (like 44.1k)
    return sound_with_altered_frame_rate.set_frame_rate(sound.frame_rate)   
     