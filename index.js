const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const audioFolder = path.join(__dirname, 'audio');
let playlist = [];
let currentTrack = 0;

function getAudioFiles() {
  return fs.readdirSync(audioFolder)
    .filter(file => ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase()));
}

function shufflePlaylist() {
  for (let i = playlist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
  }
}

app.use(express.static('public'));

app.get('/audio/:file', (req, res) => {
  const filePath = path.join(audioFolder, req.params.file);
  res.sendFile(filePath);
});

io.on('connection', (socket) => {
  socket.emit('playlist', playlist);
  socket.emit('currentTrack', currentTrack);

  socket.on('next', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    io.emit('currentTrack', currentTrack);
  });

  socket.on('previous', () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    io.emit('currentTrack', currentTrack);
  });

  socket.on('shuffle', () => {
    shufflePlaylist();
    io.emit('playlist', playlist);
  });

  socket.on('createPlaylist', (files) => {
    playlist = files;
    currentTrack = 0;
    io.emit('playlist', playlist);
    io.emit('currentTrack', currentTrack);
  });
});

playlist = getAudioFiles();
shufflePlaylist();

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});