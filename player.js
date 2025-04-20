document.addEventListener("DOMContentLoaded", () => {
  const { ipcRenderer } = require('electron');
  const path = require('path');
  const fs = require('fs');
  const NodeID3 = require('node-id3');

  // --- Helpers para portada ---
  function getDefaultCover() {
    return `file://${path.join(__dirname, 'assets', 'DK.png')}`;
  }
  function getCoverFromID3(filePath) {
    try {
      const tags = NodeID3.read(filePath);
      if (tags.image && tags.image.imageBuffer) {
        const base64 = tags.image.imageBuffer.toString('base64');
        return `data:${tags.image.mime};base64,${base64}`;
      }
    } catch (err) {
      console.error('Error leyendo ID3 de', filePath, err);
    }
    return getDefaultCover();
  }

  // --- Elementos del DOM ---
  const audioPlayer = new Audio();
  const songTitle = document.getElementById("song-title");
  const songImage = document.getElementById("song-image");
  const playBtn = document.getElementById("play-btn");
  const selectFolderBtn = document.getElementById("select-folder-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
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

  // Muestra título + portada, sin reproducir
  function showSong(song) {
    audioPlayer.src = song.file;
    songTitle.textContent = song.title;
    songImage.src = song.cover;
    playBtn.textContent = '▶';
  }

  // Carga y reproduce
  function loadSong(song) {
    showSong(song);
    audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
    playBtn.textContent = '⏸';
  }

  function nextSong() {
    if (!songs.length) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
  }

  function prevSong() {
    if (!songs.length) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
  }

  // Lista de canciones
  function populateSongsList() {
    songsList.innerHTML = '';
    songs.forEach((song, idx) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.addEventListener('click', () => {
        currentSongIndex = idx;
        loadSong(song);
        songsMenu.classList.add('hidden');
      });
      songsList.appendChild(li);
    });
  }

  function toggleSongsMenu(forceHide = null) {
    if (forceHide === true) {
      songsMenu.classList.add('hidden');
    } else if (forceHide === false) {
      songsMenu.classList.remove('hidden');
    } else {
      songsMenu.classList.toggle('show');
      songsMenu.classList.toggle('hidden');
    }
  }

  // Barras de progreso
  audioPlayer.addEventListener('timeupdate', () => {
    if (!isNaN(audioPlayer.duration)) {
      const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });
  progressContainer.addEventListener('click', e => {
    if (!isNaN(audioPlayer.duration)) {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      audioPlayer.currentTime = (clickX / rect.width) * audioPlayer.duration;
    }
  });

  // Al acabar, siguiente pista
  audioPlayer.addEventListener('ended', nextSong);

  // Selección de carpeta (no auto-play)
  selectFolderBtn.addEventListener('click', async () => {
    try {
      const paths = await ipcRenderer.invoke('open-folder-dialog');
      if (!paths || !paths.length) return;
      const folder = paths[0];
      const allFiles = fs.readdirSync(folder);
      const mp3Files = allFiles.filter(f => path.extname(f).toLowerCase() === '.mp3');

      songs = mp3Files.map(file => {
        const fullPath = path.join(folder, file);
        return {
          title: path.basename(file, '.mp3'),
          file: fullPath,
          cover: getCoverFromID3(fullPath)
        };
      });

      if (songs.length) {
        currentSongIndex = 0;
        showSong(songs[0]);
        populateSongsList();
      }
    } catch (err) {
      console.error('Error al cargar carpeta:', err);
    }
  });

  // Shuffle
  shuffleBtn.addEventListener('click', () => {
    if (!songs.length) return;
    let rand;
    do {
      rand = Math.floor(Math.random() * songs.length);
    } while (rand === currentSongIndex && songs.length > 1);
    currentSongIndex = rand;
    loadSong(songs[rand]);
  });

  // Controles básicos
  playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => console.error('Error al reproducir:', err));
      playBtn.textContent = '⏸';
    } else {
      audioPlayer.pause();
      playBtn.textContent = '▶';
    }
  });
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  hamburgerBtn.addEventListener('click', () => toggleSongsMenu());
  minBtn.addEventListener('click', () => ipcRenderer.send('minimize-app'));
  closeBtn.addEventListener('click', () => ipcRenderer.send('close-app'));

  // -- Media controls desde la thumbnail toolbar --
  ipcRenderer.on('thumbar-prev', () => prevSong());
  ipcRenderer.on('thumbar-play', () => playBtn.click());
  ipcRenderer.on('thumbar-next', () => nextSong());
});