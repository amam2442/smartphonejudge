const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isRecording = false;
let recorder;
let recordedChunks = [];
let videoElement = document.createElement('video');
videoElement.width = canvas.width;
videoElement.height = canvas.height;

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  videoElement.play();
}

function startRecording() {
  recordedChunks = [];
  const options = { mimeType: 'video/webm;codecs=vp8,opus' };
  recorder = new MediaRecorder(videoElement.srcObject, options);

  recorder.ondataavailable = event => {
    recordedChunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    playRecording(url);
  };

  recorder.start();
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

function playRecording(url) {
  const playbackElement = document.createElement('video');
  playbackElement.src = url;
  playbackElement.play();
  playbackElement.onplay = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const draw = () => {
      if (!playbackElement.paused && !playbackElement.ended) {
        ctx.drawImage(playbackElement, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
      }
    };
    draw();
  };
}

let previousFrame = null;

function detectMotion() {
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (previousFrame) {
    const diff = compareFrames(previousFrame, currentFrame);
    if (diff > 10000 && !isRecording) {
      console.log('動き検出！録画開始');
      isRecording = true;
      startRecording();
      setTimeout(() => {
        stopRecording();
        isRecording = false;
      }, 5000); // 5秒間録画
    }
  }

  previousFrame = currentFrame;
}

function compareFrames(frame1, frame2) {
  let diff = 0;
  for (let i = 0; i < frame1.data.length; i++) {
    diff += Math.abs(frame1.data[i] - frame2.data[i]);
  }
  return diff;
}

startVideo();
setInterval(detectMotion, 100); // 100msごとに動きを検出
