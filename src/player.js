document.addEventListener("DOMContentLoaded", () => {
  const path = require('path');
  
  // Lista de canciones
  const songs = [
    { 
      title: "Los pololos", 
      file: path.join(__dirname, 'songs', 'pololos.mp3'),
      cover: path.join(__dirname, 'assets', 'pololos.jpeg'),
      duration: "3:08"
    },
    { 
      title: "Yapapa", 
      file: path.join(__dirname, 'songs', 'opening1RANMA.mp3'),
      cover: path.join(__dirname, 'assets', 'ranma.webp'),
      duration: "2:45"
    }
  ];

  // Elementos del DOM
  const audioPlayer = new Audio();
  const songTitle = document.getElementById("song-title");
  const songImage = document.getElementById("song-image");
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.querySelector(".progress-bar");
  const currentTimeDisplay = document.getElementById("current-time");
  const totalTimeDisplay = document.getElementById("total-time");

  let currentSongIndex = 0;

  // Cargar canción
  function loadSong(song) {
    audioPlayer.src = song.file;
    songTitle.textContent = song.title;
    songImage.src = song.cover;
    totalTimeDisplay.textContent = song.duration;
  }

  // Actualizar barra de progreso
  function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Formatear tiempo
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    currentTimeDisplay.textContent = formatTime(currentTime);
  }

  // Event Listeners
  audioPlayer.addEventListener("timeupdate", updateProgress);
  
  playBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playBtn.textContent = "⏸";
    } else {
      audioPlayer.pause();
      playBtn.textContent = "▶";
    }
  });

  prevBtn.addEventListener("click", () => {
    currentSongIndex--;
    if (currentSongIndex < 0) currentSongIndex = songs.length - 1;
    loadSong(songs[currentSongIndex]);
    audioPlayer.play();
  });

  nextBtn.addEventListener("click", () => {
    currentSongIndex++;
    if (currentSongIndex >= songs.length) currentSongIndex = 0;
    loadSong(songs[currentSongIndex]);
    audioPlayer.play();
  });

  // Iniciar
  loadSong(songs[currentSongIndex]);
});