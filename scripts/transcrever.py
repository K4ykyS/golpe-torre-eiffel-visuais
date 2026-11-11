import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg","-v","error","-i",src,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True).stdout
audio = np.frombuffer(raw, np.float32)
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs,_ = m.transcribe(audio, language="pt", word_timestamps=True)
ws=[{"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)} for s in segs for w in s.words]
json.dump(ws, open(out,"w",encoding="utf-8"), ensure_ascii=False)
print(" ".join(f"{w['w']}@{w['s']}" for w in ws))
