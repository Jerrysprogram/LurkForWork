import { handleLoginUI } from "./helpers.js";
import { populateFeed } from "./jobs.js";
import "./dropZone.js";
import "./router.js";


if (localStorage.getItem("token")) {
    handleLoginUI();
    populateFeed();
}

