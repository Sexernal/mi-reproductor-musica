document.addEventListener("DOMContentLoaded", () => {
  const { ipcRenderer } = require('electron');
  const path = require('path');
  const fs = require('fs');

  // Elementos del DOM
  const audioPlayer = new Audio();
  const songTitle = document.getElementById("song-title");
  const songImage = document.getElementById("song-image");
  const playBtn = document.getElementById("play-btn");
  const selectFolderBtn = document.getElementById("select-folder-btn");
  const progressContainer = document.querySelector(".progress-container");
  const progressBar = document.querySelector(".progress-bar");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const songsMenu = document.getElementById("songs-menu");
  const songsList = document.getElementById("songs-list");
  const minBtn = document.getElementById("min-btn");
  const closeBtn = document.getElementById("close-btn");

  let songs = [];
  let currentSongIndex = 0;

  // Función para formatear los segundos en minutos:segundos
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Carga y reproduce una canción
  function loadSong(song) {
    audioPlayer.src = song.file;
    songTitle.textContent = song.title;
    songImage.src = song.cover || path.join(__dirname, 'assets', 'DK.png');
    audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
    playBtn.textContent = '⏸';
  }

  // Refrescar la lista de canciones en el menú hamburger
  function populateSongsList() {
    songsList.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(songs[currentSongIndex]);
        toggleSongsMenu(false); // Cierra el menú al seleccionar
      });
      songsList.appendChild(li);
    });
  }

  // Mostrar/ocultar el menú de canciones
  function toggleSongsMenu(forceHide = null) {
    // forceHide: si es true, lo cierra; si es false, lo abre; si es null, alterna
    if (forceHide === true) {
      songsMenu.classList.add('hidden');
    } else if (forceHide === false) {
      songsMenu.classList.remove('hidden');
    } else {
      songsMenu.classList.toggle('hidden');
    }
  }

  // Actualiza la barra de progreso en tiempo real
  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
      const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      durationEl.textContent = formatTime(audioPlayer.duration);
    }
  });

  // Permite mover la barra de progreso al hacer clic
  progressContainer.addEventListener('click', (e) => {
    if (audioPlayer.duration) {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audioPlayer.duration;
      audioPlayer.currentTime = newTime;
    }
  });

  // Evento para seleccionar carpeta
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
          populateSongsList(); // Crea la lista en el menú
        }
      }
    } catch (err) {
      console.error('Error al cargar carpeta:', err);
    }
  });

  // Botón de reproducir/pausar
  playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
      playBtn.textContent = '⏸';
    } else {
      audioPlayer.pause();
      playBtn.textContent = '▶';
    }
  });

  // Botón hamburger para mostrar/ocultar lista de canciones
  hamburgerBtn.addEventListener('click', () => {
    toggleSongsMenu();
  });

  // Botón minimizar
  minBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-app');
  });

  // Botón cerrar
  closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-app');
  });
});