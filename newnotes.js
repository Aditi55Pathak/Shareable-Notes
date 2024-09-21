document.addEventListener("DOMContentLoaded", () => {
  const statusButton = document.getElementById("status-button");
  const mottoButton = document.getElementById("motto-button");
  const darkModeToggle = document.createElement("button");

  darkModeToggle.textContent = "Toggle Dark Mode";
  darkModeToggle.classList.add("button");
  document.body.appendChild(darkModeToggle);

  statusButton.addEventListener("click", () => {
    const isOnline = statusButton.textContent === "Online";
    statusButton.textContent = isOnline ? "Offline" : "Online";
    statusButton.style.backgroundColor = isOnline ? "red" : "green";
  });

  mottoButton.addEventListener("click", () => {
    alert("You will become a billionaire at 45 years old.");
  });

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
});
