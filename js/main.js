// DOM 元素
const gameBox = document.querySelector('.game-box');
const mask = document.querySelector('.mask');
const maskCloseBtn = document.querySelector('.mask-close');
const btnStart = document.querySelector('.btn-start');
const btnRestart = document.querySelector('.btn-restart');
const btnHighscore = document.querySelector('.btn-highscore');
const btnRule = document.querySelector('.btn-rule');
const timeLine = document.querySelector('.time-line');
const timeText = document.querySelector('.time-text');
const scoreText = document.querySelector('.score-text');
const activeImg = document.querySelector('.active-img');

// 遊戲變數
const addScore = 10;
const loseScore = 2;
let gameGrids = null;
let score = 0;
let isInGame = false; // 是否在遊戲中
let isInGamePause = false; // 是否在遊戲中暫停, 給重新開始按鈕判斷用
let gridsNum = 3; // 幾乘幾的方格
let nowRound = 0; // 現在第幾關
let timer = null;
let totalTime = 60; // 每場遊戲總時間 (秒)
let gameTimeing = totalTime;
let targetIndex = 0; // 正確方格的位置
let highscore = { name: '', score: 0 };
let highscoreStorage = JSON.parse(localStorage.getItem('guess-the-color-highscore')); // 取得 localStorage 的最高分紀錄

// 按鈕文字
const btnStartText = '遊戲開始';
const btnPauseText = '暫停';
const btnProceedText = '繼續遊戲';

// mask 文本內容
const maskPauseText = '<h2>遊戲暫停中</h2>';
const maskRuleText = `
<h2>試試你的眼力吧 !</h2>
<p>1. 找出不同顏色的方塊加 ${addScore} 分</p>
<p>2. 找錯扣 ${loseScore} 分</p>
<p>3. 遊戲時間 ${totalTime} 秒</p>
`;

// 初始化
btnRestart.disabled = true;
timeText.innerText = gameTimeing;
scoreText.innerText = `分數 : ${score}`;
gameBox.classList.add('awaitStart');
gameBox.innerHTML = '找出不同顏色的方塊';
if (highscoreStorage) {
  highscore = highscoreStorage;
}

// Function
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 遊戲開始創建 table
function creatGrids(gridsNum) {
  gameBox.classList.remove('awaitStart');
  gameBox.innerHTML = '';
  for (let i = 0; i < gridsNum; i++) {
    const tr = gameBox.insertRow(0);
    for (let j = 0; j < gridsNum; j++) {
      const td = tr.insertCell(0);
    }
  }
  gameGrids = gameBox.querySelectorAll('td'); // 抓取創建後的 td 元素
}

// 遊戲開始隨機創建顏色設定給格子
function randomColorGrids() {
  if (!isInGame) return;
  targetIndex = random(0, gameGrids.length - 1);
  const targetColor = [];
  const differentColor = [];
  const differentValue = (200 / (nowRound + 2)) * (Math.random() > 0.5 ? 1 : -1); // 取 200 / (現在回合數+2) * (1 or -1) 當作顏色差異值
  for (let i = 0; i < 3; i++) {
    const rgbValue = random(0, 255);
    targetColor[i] = rgbValue;
    differentColor[i] = rgbValue + differentValue;
    if (targetColor[i] === differentColor[i] || differentColor[i] < 0 || differentColor[i] > 255) i--; // 如果值相同或超過0~255範圍, 則重新跑一次
  }
  for (let i = 0; i < gameGrids.length; i++) {
    gameGrids[i].style.background = i === targetIndex ? `rgb(${targetColor.join()})` : `rgb(${differentColor.join()})`;
  }
}

// 遊戲倒數計時
function timeHandler() {
  if (gameTimeing === 0) {
    gameEnd();
  } else {
    gameTimeing--;
    timeText.innerText = gameTimeing;
    timeLine.style.width = `${(gameTimeing / totalTime) * 100}%`; // 現在時間 / 總時間 *100 當作時間條寬度
  }
}

// 判斷遊戲狀態是否暫停
function gameState(toggleType, maskContent) {
  maskCloseBtn.classList.remove('show');
  isInGame = toggleType;
  mask.style.zIndex = toggleType ? -1 : 1;
  mask.style.opacity = toggleType ? 0 : 1;
  if (maskContent) mask.innerHTML = maskContent;
  isInGame ? timeText.classList.add('sway') : timeText.classList.remove('sway');
  btnDisabled(toggleType);
}

// 重新開始, 最高分紀錄, 遊戲規則 disabled 判斷
function btnDisabled(toggleType) {
  btnHighscore.disabled = toggleType ? true : false;
  btnRule.disabled = toggleType ? true : false;
  btnRestart.disabled = toggleType || isInGamePause ? false : true;
}

// 點擊正確或錯誤, 顯示想對應圖片動畫與音效
function activeAnimate(isCorrect) {
  let activeAudio = new Audio(isCorrect ? './audio/correct.wav' : './audio/error.wav');
  activeAudio.play();
  activeImg.style.backgroundImage = `url("${isCorrect ? './images/correct' : './images/error'}.png")`;
  activeImg.classList.add('animate__animated', 'animate__bounceIn');
  activeImg.addEventListener('animationend', () => {
    activeImg.classList.remove('animate__animated', 'animate__bounceIn');
  });
}

// 遊戲結束, 紀錄分數與初始化遊戲
function gameEnd(isRestart) {
  if ((!highscoreStorage || highscoreStorage.score < score) && score > 0 && !isRestart) {
    const playerName = prompt('恭喜得到最高分 ! 請輸入你的名字');
    highscore.name = playerName || '路人甲';
    highscore.score = score;
    localStorage.setItem('guess-the-color-highscore', JSON.stringify(highscore)); // 設定最高分存到 localStorage
  } else if (!isRestart) {
    alert('沒有打破紀錄, 再試試看吧 ! ');
  }
  if (!isRestart) {
    gameBox.innerHTML = '找出不同顏色的方塊';
    gameBox.classList.add('awaitStart');
  }
  isInGame = false;
  gridsNum = 3;
  nowRound = 0;
  gameTimeing = totalTime;
  timeText.innerText = gameTimeing;
  timeLine.style.width = '100%';
  score = 0;
  scoreText.innerText = `分數 : ${score}`;
  clearInterval(timer);
  timeText.classList.remove('sway');
  // Button 初始化
  btnStart.value = btnStartText;
  btnDisabled(isInGame);
}

// Event

// 開始, 暫停, 繼續 Button
btnStart.addEventListener('click', () => {
  if (btnStart.value === btnStartText) {
    const startAudio = new Audio('./audio/start.mp3');
    startAudio.play();
    gameState(true);
    creatGrids(gridsNum); // 創建 3*3 格子
    randomColorGrids(); // 啟動遊戲, 每次隨機創建顏色格子
    timer = setInterval(timeHandler, 1000); // 遊戲時間倒數計時
    btnStart.value = btnPauseText;
  } else if (btnStart.value === btnPauseText) {
    isInGamePause = true;
    gameState(false, maskPauseText);
    clearInterval(timer);
    btnStart.value = btnProceedText;
  } else {
    isInGamePause = false;
    gameState(true);
    timer = setInterval(timeHandler, 1000);
    btnStart.value = btnPauseText;
  }
});

// 重新開始 Button
btnRestart.addEventListener('click', () => {
  if (btnStart.value === btnStartText && !isInGame) return;
  gameEnd('restart');
  gameState(true);
  randomColorGrids();
  timer = setInterval(timeHandler, 1000);
  btnStart.value = btnPauseText;
});

// 最高分紀錄 Button
btnHighscore.addEventListener('click', () => {
  if (isInGame) return;
  highscoreStorage = JSON.parse(localStorage.getItem('guess-the-color-highscore'));
  const maskHighestScoreText = highscoreStorage
    ? `<h2>目前最高分 : ${highscore.score}</h2> <p>玩家 : ${highscore.name}</p>`
    : '<h2>還沒有最高分...</h2>';
  gameState(false, maskHighestScoreText);
  if (btnStart.value === btnStartText) maskCloseBtn.classList.add('show');
});

// 規則 Button
btnRule.addEventListener('click', () => {
  if (isInGame) return;
  gameState(false, maskRuleText);
  if (btnStart.value === btnStartText) maskCloseBtn.classList.add('show');
});

// 遊戲中判斷是否點擊正確顏色的格子
gameBox.addEventListener('click', (e) => {
  if (e.target.tagName !== 'TD' || !isInGame) return;
  if (e.target === gameGrids[targetIndex]) {
    score += addScore;
    nowRound++;
    if (gridsNum < 9) gridsNum++;
    creatGrids(gridsNum);
    randomColorGrids();
    activeAnimate(true);
  } else {
    score -= loseScore;
    activeAnimate(false);
  }
  scoreText.innerText = `分數 : ${score}`;
});

// maskCloseBtn
maskCloseBtn.addEventListener('click', () => {
  maskCloseBtn.classList.remove('show');
  mask.style.zIndex = -1;
  mask.style.opacity = 0;
});
