const liveFeed = document.getElementById('liveFeed');
const replay = document.getElementById('replay');
const startReplayButton = document.getElementById('startReplay');

const mediaStreamConstraints = { video: true };
const recordedChunks = [];
let mediaRecorder;

// Initialize camera
navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(stream => {
    liveFeed.srcObject = stream;

    // Setup MediaRecorder
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Automatically record in chunks
    setInterval(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      mediaRecorder.start();
    }, 5000); // Record every 5 seconds
  })
  .catch(error => {
    console.error('Error accessing the camera:', error);
  });

// Replay functionality
startReplayButton.addEventListener('click', () => {
  if (recordedChunks.length > 0) {
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    replay.src = URL.createObjectURL(recordedBlob);
    replay.style.display = 'block';
    replay.play();
  } else {
    alert('No recorded video available for replay.');
  }
});
