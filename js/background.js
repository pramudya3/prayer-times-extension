// background.js: Service Worker for notification scheduling

chrome.runtime.onInstalled.addListener(() => {
  console.log("Prayer Times Extension Installed");
  scheduleAlarmsFromStorage();
});

// Periodic check if alarms are missing (e.g. extension was updated or browser restarted)
chrome.runtime.onStartup.addListener(() => {
  scheduleAlarmsFromStorage();
});

// Listen for messages from popup.js to reschedule alarms
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "RESCHEDULE_ALARMS") {
    scheduleAlarmsFromStorage();
    if (sendResponse) sendResponse({ status: "success" });
  }
});

// Listen for alarms and trigger events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "daily-refresh") {
    refreshTimingsAndAlarms();
  } else if (alarm.name.startsWith("prayer-")) {
    const prayerName = alarm.name.split("-")[1];

    // Check notification settings for this prayer
    const data = await chrome.storage.local.get("notifSettings");
    const settings = data.notifSettings || {};
    const isSilent = settings[prayerName] === "silent";

    const notificationId = `prayer-${prayerName}-${Date.now()}`;
    chrome.notifications.create(notificationId, {
      type: "basic",
      iconUrl: "/assets/icons/icon128.png", // Use absolute extension path
      title: `Prayer Time: ${prayerName}`,
      message: `It is now time for ${prayerName}.`,
      priority: 2,
      silent: isSilent,
      requireInteraction: true
    }, (id) => {
      if (chrome.runtime.lastError) {
        console.error("Notification Error:", chrome.runtime.lastError.message);
      }
    });

    if (!isSilent) {
      playNotificationSound();
    }
  }
});

// Helper to play sound using an offscreen document
async function playNotificationSound() {
  if (!(await chrome.offscreen.hasDocument())) {
    await chrome.offscreen.createDocument({
      url: "pages/offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play notification sound for prayer times",
    });
  }

  setTimeout(() => {
    chrome.runtime.sendMessage({ type: "PLAY_SOUND" });
  }, 100);

  setTimeout(() => {
    chrome.offscreen.closeDocument();
  }, 15000);
}

async function scheduleAlarmsFromStorage() {
  const data = await chrome.storage.local.get("timings");
  if (!data || !data.timings) return;

  const timings = data.timings;
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  await chrome.alarms.clearAll();

  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  prayers.forEach(name => {
    const timeStr = timings[name];
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const prayerDate = new Date(currentYear, currentMonth, currentDay, hours, minutes);
      if (prayerDate > now) {
        chrome.alarms.create(`prayer-${name}`, { when: prayerDate.getTime() });
      }
    }
  });

  // Schedule a refresh for 00:01 tomorrow to get the next day's times
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0);
  chrome.alarms.create("daily-refresh", { when: tomorrow.getTime() });
}

// Automatically fetch new timings without opening the popup
async function refreshTimingsAndAlarms() {
  const data = await chrome.storage.local.get(["latitude", "longitude"]);
  if (!data.latitude || !data.longitude) return;

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${data.latitude}&longitude=${data.longitude}&method=20&tune=0,0,0,3,1,3,0,2,0`
    );
    const result = await response.json();
    const timings = result.data.timings;

    // Save to storage
    await chrome.storage.local.set({ timings });
    await scheduleAlarmsFromStorage();
  } catch (err) {
    console.error("Failed to auto-refresh timings", err);
  }
}
