// Listen for play sound messages
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "PLAY_SOUND") {
    playSound(request.url);
  }
});

function playSound(url) {
  // Use local Adzan sound
  const audio = new Audio(url || "./adzan-takbir.mp3");
  audio.play();
}
