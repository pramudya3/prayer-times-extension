// Apply initial theme from storage as early as possible
if (localStorage.getItem("theme") === "light") {
  document.documentElement.classList.add("light-mode");
}
