const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const message = document.getElementById('message');
const shuttleImage = document.getElementById('shuttleImage');

let shuttleDetected = false;
let shuttleYPosition = 0;
const groundThreshold = 380; // 床の位置の閾値（適宜調整）

// Webカメラの映像を取得
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // スマホの後ろのカメラを使用
    width: { ideal: 250 },
    height: { ideal: 400 }
  }
})
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error('エラー:', err);
  });

// シャトルの検出関数
function detectShuttle(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let detected = false;
  let yPositionSum = 0;
  let bluePixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = Math.floor((i / 4) / width); // ピクセルのY座標

    // 青色のピクセルを検出
    if (b > 150 && r < 80 && g < 80) {
      detected = true;
      yPositionSum += y;
      bluePixelCount++;
    }
  }

  if (detected && bluePixelCount > 0) {
    shuttleYPosition = yPositionSum / bluePixelCount;
  }

  return detected;
}

// 定期的にフレームをキャプチャして解析
function processFrame() {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  shuttleDetected = detectShuttle(context, canvas.width, canvas.height);

  if (shuttleDetected) {
    if (shuttleYPosition > groundThreshold) {
      message.textContent = "シャトルが床に着地しました！";
      const imageDataURL = canvas.toDataURL();
      shuttleImage.src = imageDataURL;
      shuttleImage.width = 250;
      shuttleImage.height = 400;

      shuttleImage.style.display = 'block';
    } else {
      message.textContent = "シャトルが見つかりました！";
    }
  } else {
    message.textContent = "";
  }
  requestAnimationFrame(processFrame);
}

// ビデオの準備ができたらフレームの処理を開始
video.addEventListener('play', () => {
  requestAnimationFrame(processFrame);
});
