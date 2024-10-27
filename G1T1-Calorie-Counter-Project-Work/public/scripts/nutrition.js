// Pop up for the home page
const nutritionPopup = document.getElementById("nutritionPopup");
const closePopup = document.getElementById("closePopup");
const playButton = document.querySelector(".play-button");

// Show pop-up when "Calculate My Nutrition" button is clicked
playButton.addEventListener("click", function () {
  nutritionPopup.style.display = "block";
});

// Hide pop-up when the red cross is clicked
closePopup.addEventListener("click", function () {
  nutritionPopup.style.display = "none";
});

// Optional: Close the pop-up when clicking outside of it
window.addEventListener("click", function (event) {
  if (event.target === nutritionPopup) {
    nutritionPopup.style.display = "none";
  }
});
