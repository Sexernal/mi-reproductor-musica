document.addEventListener("DOMContentLoaded", () => {
  const { ipcRenderer } = require('electron');
  const path = require('path');
  const fs = require('fs');

  // Elementos del DOM (según el nuevo layout)
  const audioPlayer = new Audio();
  const songTitle = document.getElementById("song-title");
  const songImage = document.getElementById("song-image");
  const playBtn = document.getElementById("play-btn");
  const selectFolderBtn = document.getElementById("select-folder-btn");
  const progressContainer = document.querySelector(".progress-container");
  const progressBar = document.querySelector(".progress-bar");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const songsMenu = document.getElementById("songs-menu");
  const songsList = document.getElementById("songs-list");
  const minBtn = document.getElementById("min-btn");
  const closeBtn = document.getElementById("close-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  let songs = [];
  let currentSongIndex = 0;

  // Función para formatear el tiempo (mm:ss)
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Carga y reproduce la canción
  function loadSong(song) {
    audioPlayer.src = song.file;
    songTitle.textContent = song.title;
    // Utiliza la imagen de portada proporcionada o la por defecto
    songImage.src = song.cover || path.join(__dirname, 'assets', 'DK.png');
    audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
    playBtn.textContent = '⏸';
  }

  // Genera la lista de canciones para el menú hamburguesa
  function populateSongsList() {
    songsList.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(songs[currentSongIndex]);
        toggleSongsMenu(false);
      });
      songsList.appendChild(li);
    });
  }

  // Alterna la visibilidad del menú de canciones
  function toggleSongsMenu(forceHide = null) {
    if (forceHide === true) {
      songsMenu.classList.add('hidden');
    } else if (forceHide === false) {
      songsMenu.classList.remove('hidden');
    } else {
      songsMenu.classList.toggle('hidden');
    }
  }

  // Actualiza la barra de progreso y la visualización del tiempo
  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
      const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
  });

  // Permite interactuar con la barra de progreso mediante clic
  progressContainer.addEventListener('click', (e) => {
    if (audioPlayer.duration) {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audioPlayer.duration;
      audioPlayer.currentTime = newTime;
    }
  });

  // Evento para seleccionar carpeta y cargar pistas de audio
  selectFolderBtn.addEventListener('click', async () => {
    try {
      const folderPaths = await ipcRenderer.invoke('open-folder-dialog');
      if (folderPaths && folderPaths.length > 0) {
        const folderPath = folderPaths[0];
        const files = fs.readdirSync(folderPath);
        songs = files
          .filter(file => path.extname(file).toLowerCase() === '.mp3')
          .map(file => ({
            title: path.basename(file, '.mp3'),
            file: path.join(folderPath, file),
            cover: path.join(__dirname, 'assets', 'default-cover.jpg')
          }));
        if (songs.length > 0) {
          currentSongIndex = 0;
          loadSong(songs[currentSongIndex]);
          populateSongsList();
        }
      }
    } catch (err) {
      console.error('Error al cargar carpeta:', err);
    }
  });

  // Botón reproducir/pausar
  playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
      playBtn.textContent = '⏸';
    } else {
      audioPlayer.pause();
      playBtn.textContent = '▶';
    }
  });

  // Botón de retroceder (canción anterior)
  prevBtn.addEventListener('click', () => {
    if (songs.length > 0) {
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      loadSong(songs[currentSongIndex]);
    }
  });

  // Botón de avanzar (siguiente canción)
  nextBtn.addEventListener('click', () => {
    if (songs.length > 0) {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      loadSong(songs[currentSongIndex]);
    }
  });

  // Botón hamburguesa para mostrar/ocultar la lista de canciones
  hamburgerBtn.addEventListener('click', () => {
    toggleSongsMenu();
  });

  // Botones para minimizar y cerrar la aplicación
  minBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-app');
  });
  closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-app');
  });
});