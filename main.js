// カメラ映像を取得する
async function startCamera() {
  try {
    // デバイスのカメラを取得
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Canvasの設定
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // 動画が再生されるとCanvasに描画する
    video.addEventListener('play', () => {
      function drawFrame() {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      }
      drawFrame();
    });
  } catch (err) {
    console.error("カメラの取得に失敗しました:", err);
  }
}

// ページロード時にカメラを開始
startCamera();
