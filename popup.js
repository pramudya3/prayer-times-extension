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

    // Cache the timings object
    localStorage.setItem("timings", JSON.stringify(timings));

    displayPrayersFromTimings(timings);
  } catch (err) {
    if (!prayerTimesDiv.querySelector(".prayer-card")) {
      prayerTimesDiv.innerHTML = translations.failed;
    }
  }
}

function displayPrayersFromTimings(timings) {
  const prayers = [
    { name: translations.fajr, time: timings.Fajr },
    { name: translations.sunrise, time: timings.Sunrise },
    { name: translations.dhuhr, time: timings.Dhuhr },
    { name: translations.asr, time: timings.Asr },
    { name: translations.maghrib, time: timings.Maghrib },
    { name: translations.isha, time: timings.Isha },
  ];

  const prayerTimesDiv = document.getElementById("prayerTimes");
  prayerTimesDiv.innerHTML = prayers
    .map(
      (p) => `
      <div class="prayer-card">
        <div class="prayer-name">${p.name}</div>
        <div class="prayer-time">${p.time}</div>
      </div>
    `
    )
    .join("");
}

