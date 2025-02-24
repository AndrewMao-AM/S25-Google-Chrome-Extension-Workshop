let WORK_TIME_SEC = 1 * 60; // Modify this value
let BREAK_TIME_SEC = 0.25 * 60; // Modify this value
let VIDEO_URL = "https://youtu.be/MKC9LvRivTM?t=7";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    is_on: false,
    timer: WORK_TIME_SEC,
    is_break: false,
    break_tab_id: null,
  });
});

chrome.storage.local.get(
  ["timer", "is_on", "is_break", "break_tab_id"],
  (data) => {
    chrome.storage.local.set({
      timer: "timer" in data ? data.timer : WORK_TIME_SEC,
      is_on: "is_on" in data ? data.is_on : false,
      is_break: "is_break" in data ? data.is_break : false,
      break_tab_id: "break_tab_id" in data ? data.break_tab_id : null,
    });
  }
);

chrome.alarms.create("pomodoroTimer", {
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "pomodoroTimer") {
    chrome.storage.local.get(["is_on", "timer", "is_break"], async (data) => {
      if (data.is_on && data.timer > 0) {
        await chrome.storage.local.set({ timer: data.timer - 1 });
        console.log(`Timer: ${data.timer - 1}`);
      } else if (data.is_on && data.timer === 0) {
        if (!data.is_break) {
          startBreak();
        } else {
          restartWorkSession();
        }
      }
    });
  }
});

const startBreak = () => {
  console.log("Starting break time:");
  chrome.tabs.create({ url: VIDEO_URL, active: true }, (tab) => {
    chrome.storage.local.set({
      is_break: true,
      timer: BREAK_TIME_SEC,
      break_tab_id: tab.id,
    });

    setTimeout(() => {
      chrome.tabs.remove(tab.id, () => console.log("Closed break video"));
      chrome.storage.local.set({ break_tab_id: null });
    }, BREAK_TIME_SEC * 1000);
  });
};

const restartWorkSession = () => {
  console.log("Restarting work session");
  console.log(WORK_TIME_SEC);
  chrome.storage.local.set({
    is_break: false,
    timer: WORK_TIME_SEC,
  });
};
