#!/bin/sh
# uso: mux-piloto.sh visual.mp4 narracao.mp3 saida.mp4  (corta o trecho 29,95 s + 10,5 s da narração; sem mudar velocidade)
ffmpeg -y -i "$1" -ss 29.95 -t 10.5 -i "$2" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -af "afade=t=out:st=10.3:d=0.2" -shortest "$3"
