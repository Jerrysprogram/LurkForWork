import { handleLoginUI } from "./helpers.js";
import { populateFeed } from "./jobs.js";
import "./dropZone.js";
import "./router.js";


if (localStorage.getItem("token")) {
    handleLoginUI();
    populateFeed();
}

// main.js
window.addEventListener("DOMContentLoaded", () => {
    // init flatpickr
    flatpickr("#job-start-date", {
      dateFormat: "Y-m-d",
      locale: "en",
      minDate: "today",
      onChange: (selectedDates, dateStr, instance) => {
        console.log("User picked date: ", dateStr);
      },
    });
  });
  