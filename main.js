// 获取页面元素
const audio = document.getElementById("audio");
const lyricsDisplay = document.querySelector(".lyrics-display");

// 歌曲和歌词路径数组
const songs = ['song1.mp3', 'song2.mp3'];
const lyrics = ['song1.lrc', 'song2.lrc'];

// 当前播放的索引
let currentIndex = 0;

// 设置音乐源和加载歌词
function loadSong(index) {
    audio.src = `music/${songs[index]}`;
    fetch(`lyrics/${lyrics[index]}`)
        .then(response => response.text())
        .then(data => {
            const parsedLyrics = parseLyrics(data);
            displayLyrics(parsedLyrics);
            // 此处我们将解析歌词
        });
}

// 调用loadSong函数加载第一首歌
loadSong(currentIndex);

function parseLyrics(lyricsText) {
    const lines = lyricsText.split('\n'); // 分割每行歌词
    const regex = /\[(\d{2}):(\d{2})\.(\d{2})\](.+)/; // 正则匹配歌词时间和内容

    const parsedLyrics = [];

    lines.forEach(line => {
        const match = regex.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const text = match[4];

            // 将时间转换为秒
            const time = minutes * 60 + seconds + milliseconds / 100;
            parsedLyrics.push({ time, text });
        }
    });

    return parsedLyrics;
}


function displayLyrics(lyrics) {
    lyricsDisplay.innerHTML = lyrics.map(line => `<p data-time="${line.time}">${line.text}</p>`).join('\n');
}

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const activeLine = Array.from(lyricsDisplay.querySelectorAll('p')).find(line => line.dataset.time <= currentTime && (!line.nextElementSibling || line.nextElementSibling.dataset.time > currentTime));

    if (activeLine) {
        activeLine.classList.add('active');
        if (activeLine.previousElementSibling) activeLine.previousElementSibling.classList.remove('active');
        if (activeLine.nextElementSibling) activeLine.nextElementSibling.classList.remove('active');
    }
});

document.getElementById('prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
});

document.getElementById('next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
});

const songList = document.querySelector('.song-list');

function displaySongList() {
    songList.innerHTML = songs.map((song, index) => `<li data-index="${index}">${song.replace('.mp3', '')}</li>`).join('');
}

songList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        currentIndex = parseInt(e.target.dataset.index);
        loadSong(currentIndex);
        audio.play();
    }
});

displaySongList();

let playMode = 'list'; // list, single, random

function nextSong() {
    if (playMode === 'list') {
        currentIndex = (currentIndex + 1) % songs.length;
    } else if (playMode === 'random') {
        currentIndex = Math.floor(Math.random() * songs.length);
    }
    // 对于单曲循环，我们不更改currentIndex
    loadSong(currentIndex);
    audio.play();
}

audio.addEventListener('ended', nextSong);

document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.mp3')) {
            songs.push(file.name);
        } else if (file.name.endsWith('.lrc')) {
            lyrics.push(file.name);
        }
    }
    displaySongList();
});

