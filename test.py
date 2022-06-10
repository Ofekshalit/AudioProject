from pydub import AudioSegment, audio_segment
import os
import pydub
# from pydub.playback import play
from audio_settings import Files_settings
# from playsound import playsound
from pydub.playback import play
import tempfile
import shutil
from pathlib import Path, PureWindowsPath

# file = open(' C:////RUMine.mp3', "rb")

print(Path('D:\\songs\\files\\infiles\\Bob Marley- Three Little Birds.mp3')) 

# audio = AudioSegment.from_mp3("C:\RUMine.mp3")

# audio = audio - 35

# array = [('RUMine', 'C:/dame/scam.mp3', 150, 1.5, 30, 150, 12, 12), ('RUMine', 'C:/dame/scam.mp3', 150, 1.5, 30, 150, 12, 12), ('RUMine', 'C:/dame/scam.mp3', 150, 1.5, 30, 150, 12, 12)]

# print(",".join([str(value) for value in array[0]]) + "/")

# def speed_change(sound, speed=1.0):
#     # Manually override the frame_rate. This tells the computer how many
#     # samples to play per second
#     sound_with_altered_frame_rate = sound._spawn(sound.raw_data, overrides={
#          "frame_rate": int(float(   sound.frame_rate * float(speed)))
#       })
#      # convert the sound with altered frame rate to a standard frame rate
#      # so that regular playback programs will work right. They often only
#      # know how to play audio at standard frame rate (like 44.1k)
#     return sound_with_altered_frame_rate.set_frame_rate(sound.frame_rate)


# audio = speed_change(audio, 2)
# audio = speed_change(audio, 2)

# shutil.copy('C:/RUMine.mp3', 'F:/AudioProject3 - 16.2.22/RUMine-web.mp3')

str1 = "(1, 'Arctic Monkeys - (R U Mine_edit)', 'C:\\Arctic Monkeys - R U Mine.mp3', 'C:/audio songs/', 201, 100, 0, 0, 1, 0, 201.08480725623582)"

new = ""

print(str(str1[1:len(str1)-1]))

# for i in range(len(str.split("("))):
#     if str.split("(")[i][0].find(")") == -1:
#         new = str.split("(")[i][0]
