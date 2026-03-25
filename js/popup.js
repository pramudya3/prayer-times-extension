// Apply initial theme from storage
if (localStorage.getItem("theme") === "light") {
  document.documentElement.classList.add("light-mode");
}

const translations = {
  title: "Prayer Times",
  getBtn: "Get Prayer Times",
  refreshBtn: "Refresh Location",
  identifying: "Identifying your location...",
  loading: "Loading prayer times...",
  failed: "Failed to load prayer times.",
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

document.addEventListener("DOMContentLoaded", () => {
  const savedLat = localStorage.getItem("latitude");
  const savedLon = localStorage.getItem("longitude");
  const savedCity = localStorage.getItem("city");

  if (savedLat && savedLon) {
    const myLocation = document.getElementById("myLocation");

    if (savedCity) {
      myLocation.innerHTML = savedCity;
    } else {
      myLocation.innerHTML = `${parseFloat(savedLat).toFixed(4)}, ${parseFloat(
        savedLon
      ).toFixed(4)}`;
    }

    // NEW: Load cached timings immediately for persistence
    const savedTimings = localStorage.getItem("timings");
    if (savedTimings) {
      try {
        const timings = JSON.parse(savedTimings);
        displayPrayersFromTimings(timings);
      } catch (e) {
        console.error("Failed to parse cached timings", e);
      }
    }

    getPrayerTimes(savedLat, savedLon);
  } else {
    document.getElementById("myLocation").innerHTML = "---";
  }

  // Bind events
  document.getElementById("getPrayerTimes").addEventListener("click", getLocation);
  document.getElementById("toggleTheme").addEventListener("click", toggleTheme);
  document.getElementById("notifyMe").addEventListener("click", notifMe);

  // Proactively request permission for background notifications
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
});

function toggleTheme() {
  document.documentElement.classList.toggle("light-mode");
  const isLight = document.documentElement.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

function toggleLoading(show) {
  const btn = document.getElementById("getPrayerTimes");
  const icon = btn.querySelector("i");
  if (show) {
    icon.classList.add("fa-spin");
    btn.style.pointerEvents = "none";
  } else {
    icon.classList.remove("fa-spin");
    btn.style.pointerEvents = "auto";
  }
}

function getLocation() {
  const prayerTimesDiv = document.getElementById("prayerTimes");
  toggleLoading(true);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      success,
      (err) => {
        error();
        toggleLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    prayerTimesDiv.innerHTML = "Geolocation is not supported by this browser.";
    toggleLoading(false);
  }
}

async function success(position) {
  const myLocation = document.getElementById("myLocation");
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  localStorage.setItem("latitude", latitude);
  localStorage.setItem("longitude", longitude);
  chrome.storage.local.set({ latitude, longitude });

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const locationData = await response.json();
    const city =
      locationData.city || locationData.locality || "Unknown location";
    const country = locationData.countryName || "";
    const cityText = `${city}${country ? ", " + country : ""}`;

    myLocation.innerHTML = cityText;
    localStorage.setItem("city", cityText);
  } catch (err) {
    const latText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    myLocation.innerHTML = latText;
    localStorage.setItem("city", latText);
  }

  await getPrayerTimes(latitude, longitude);
  toggleLoading(false);
}

function error() {
  const prayerTimesDiv = document.getElementById("prayerTimes");
  prayerTimesDiv.innerHTML = "Unable to retrieve your location.";
}

async function getPrayerTimes(latitude, longitude) {
  const prayerTimesDiv = document.getElementById("prayerTimes");

  // Only show spinner if we don't have any content yet
  if (!prayerTimesDiv.innerHTML.trim() || prayerTimesDiv.querySelector(".fa-spinner")) {
    prayerTimesDiv.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${translations.loading}`;
  }

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=20&tune=0,0,0,3,1,3,0,2,0`
    );
    const data = await response.json();
    const timings = data.data.timings;

    // Cache the timings object for the popup
    localStorage.setItem("timings", JSON.stringify(timings));

    // Support background notifications: Save to chrome.storage and notify background script
    chrome.storage.local.set({ timings }, () => {
      chrome.runtime.sendMessage({ type: "RESCHEDULE_ALARMS" });
    });

    displayPrayersFromTimings(timings);
  } catch (err) {
    if (!prayerTimesDiv.querySelector(".prayer-card")) {
      prayerTimesDiv.innerHTML = translations.failed;
    }
  }
}

async function displayPrayersFromTimings(timings) {
  const prayers = [
    { name: translations.fajr, time: timings.Fajr, key: "Fajr" },
    { name: translations.sunrise, time: timings.Sunrise, key: "Sunrise" },
    { name: translations.dhuhr, time: timings.Dhuhr, key: "Dhuhr" },
    { name: translations.asr, time: timings.Asr, key: "Asr" },
    { name: translations.maghrib, time: timings.Maghrib, key: "Maghrib" },
    { name: translations.isha, time: timings.Isha, key: "Isha" },
  ];

  // Load notification settings
  const data = await chrome.storage.local.get("notifSettings");
  const settings = data.notifSettings || {};

  const prayerTimesDiv = document.getElementById("prayerTimes");
  prayerTimesDiv.innerHTML = prayers
    .map((p) => {
      const isSilent = settings[p.key] === "silent";
      return `
      <div class="prayer-card ${isSilent ? "is-silent" : ""}" data-key="${p.key}">
        <div class="card-content">
          <div class="prayer-name">${p.name}</div>
          <div class="prayer-time">${p.time}</div>
        </div>
        <div class="card-options">
          <button class="notif-toggle" title="Toggle Sound">
             <i class="fa ${isSilent ? "fa-bell-slash" : "fa-bell"}"></i>
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  // Add click listeners to toggles
  document.querySelectorAll(".notif-toggle").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const card = btn.closest(".prayer-card");
      const key = card.dataset.key;
      const icon = btn.querySelector("i");

      // Toggle state
      const data = await chrome.storage.local.get("notifSettings");
      const settings = data.notifSettings || {};
      const newState = settings[key] === "silent" ? "active" : "silent";
      settings[key] = newState;

      // Update UI
      icon.className = `fa ${newState === "silent" ? "fa-bell-slash" : "fa-bell"}`;
      card.classList.toggle("is-silent", newState === "silent");

      // Save
      await chrome.storage.local.set({ notifSettings: settings });
    });
  });
}

function notifMe() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return;
  }

  const savedTimings = localStorage.getItem("timings");
  if (!savedTimings) {
    new Notification("Please get prayer times first!");
    return;
  }

  const timings = JSON.parse(savedTimings);
  const prayers = [
    { name: translations.fajr, time: timings.Fajr },
    { name: translations.sunrise, time: timings.Sunrise },
    { name: translations.dhuhr, time: timings.Dhuhr },
    { name: translations.asr, time: timings.Asr },
    { name: translations.maghrib, time: timings.Maghrib },
    { name: translations.isha, time: timings.Isha },
  ];

  const now = new Date();
  const next = findNextPrayer(prayers, now);

  const title = next ? `Next Prayer: ${next.name}` : "All prayers for today have passed!";
  const body = next ? `It will be at ${next.time}` : "Check back tomorrow!";

  // if there are no permission granted, show ask for permission first
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    // Play sound manually for test button
    new Audio("../assets/sounds/adzan-takbir.mp3").play();

    chrome.notifications.create({
      type: "basic",
      iconUrl: "../assets/icons/icon128.png",
      title: title,
      message: body,
      priority: 2,
      requireInteraction: true,
      silent: false
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Play sound manually for test button
        new Audio("../assets/sounds/adzan-takbir.mp3").play();

        chrome.notifications.create({
          type: "basic",
          iconUrl: "../assets/icons/icon128.png",
          title: title,
          message: body,
          priority: 2,
          requireInteraction: true,
          silent: false
        });
      }
    });
  }
}

function findNextPrayer(prayers, now) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const p of prayers) {
    const [hours, minutes] = p.time.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentMinutes) {
      return p;
    }
  }
  return null;
}

