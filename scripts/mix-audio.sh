#!/bin/sh
# uso: mix-audio.sh narracao.mp3 trilha.wav efeitos.wav saida.wav
# Narração intacta (sem cortes, sem mudar velocidade, volume original). Trilha baixa e ainda mais baixa
# enquanto há voz (sidechain); efeitos discretos por cima.
ffmpeg -y -i "$1" -i "$2" -i "$3" -filter_complex "\
[0:a]aresample=44100,aformat=channel_layouts=stereo,asplit=2[voz][sc];\
[1:a]volume=0.16[mus];\
[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=60:release=600:makeup=1[musd];\
[2:a]volume=0.35[fx];\
[voz][musd][fx]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.95[out]" \
-map "[out]" -c:a pcm_s16le "$4"
