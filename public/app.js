const socket = io();
const audioPlayer = document.getElementById('audioPlayer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const shuffleButton = document.getElementById('shuffleButton');
const playlistElement = document.getElementById('playlist');
const allTracksElement = document.getElementById('allTracks');
const createPlaylistButton = document.getElementById('createPlaylistButton');

let playlist = [];
let currentTrack = 0;

socket.on('playlist', (newPlaylist) => {
  playlist = newPlaylist;
  updatePlaylistUI();
});

socket.on('currentTrack', (newTrack) => {
  currentTrack = newTrack;
  playCurrentTrack();
});

function updatePlaylistUI() {
  playlistElement.innerHTML = '';
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track;
    if (index === currentTrack) {
      li.classList.add('playing');
    }
    playlistElement.appendChild(li);
  });

  allTracksElement.innerHTML = '';
  playlist.forEach((track) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = track;
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(track));
    allTracksElement.appendChild(li);
  });
}

function playCurrentTrack() {
  audioPlayer.src = `/audio/${playlist[currentTrack]}`;
  audioPlayer.play();
  updatePlaylistUI();
}

prevButton.addEventListener('click', () => {
  socket.emit('previous');
});

nextButton.addEventListener('click', () => {
  socket.emit('next');
});

shuffleButton.addEventListener('click', () => {
  socket.emit('shuffle');
});

createPlaylistButton.addEventListener('click', () => {
  const selectedTracks = Array.from(allTracksElement.querySelectorAll('input:checked')).map(input => input.value);
  socket.emit('createPlaylist', selectedTracks);
});

audioPlayer.addEventListener('ended', () => {
  socket.emit('next');
});