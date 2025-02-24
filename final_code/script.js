let WORK_TIME_SEC = 1 * 60; // Modify this value to match ./background.js WORK_TIME_SEC
let timerIntervalId;

const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");

const setTimerDisplay = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timerDisplay.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const updateTimer = () => {
  chrome.storage.local.get(["timer", "is_break"], (data) => {
    setTimerDisplay(data.timer);
    if (data.is_break) {
      startButton.style.display = "none";
      resetButton.style.display = "none";
      document.getElementById("break-message").style.display = "block";
    } else {
      startButton.style.display = "inline-block";
      resetButton.style.display = "inline-block";
      document.getElementById("break-message").style.display = "none";
    }
  });
};

const startTimer = () => {
  timerIntervalId = setInterval(updateTimer, 1000);
  startButton.textContent = "Stop";
};

updateTimer();
chrome.storage.local.get(["is_on"], (data) => {
  if (data.is_on) {
    startTimer();
  }
});

const stopTimer = () => {
  clearInterval(timerIntervalId);
  startButton.textContent = "Start";
};

startButton.addEventListener("click", () => {
  chrome.storage.local.get(["is_on"], (data) => {
    if (data.is_on) {
      stopTimer();
      chrome.storage.local.set({ is_on: false });
    } else {
      startTimer();
      chrome.storage.local.set({ is_on: true });
    }
  });
});

resetButton.addEventListener("click", async () => {
  stopTimer();
  setTimerDisplay(WORK_TIME_SEC);
  await chrome.storage.local.set({
    timer: WORK_TIME_SEC,
    is_on: false,
  });
});
