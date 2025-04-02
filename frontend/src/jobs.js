
import { apiCall, show, hide, fileToDataUrl, getUsernameById } from "./helpers.js";
import { showErrorPopup } from "./auth.js";
import { populateUserInfo, populateWatchees } from "./users.js";

let currentJobId = null;
let lastFeedContentHash = null;
let lastNumFeedItems = null;
let currentPage = 0;

const itemsPerPage = 5;


let populateFeedLock = false;

export const populateFeed = () => {
    if (populateFeedLock) {
        return;
    }
    populateFeedLock = true;
    const scrollPosition = {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop,
    };
    const containerId = "feed-items";
    apiCall("job/feed?start=0", "GET", {})
        .then((data) => {
            console.log(data)
           
            localStorage.setItem("feed", JSON.stringify(data));
            currentPage = 0; 
            lastFeedContentHash = jsonHash(data);
            document.getElementById(containerId).textContent = "";
            if(data.length === 0) { 
                document.getElementById('feed-items').innerHTML = '<p class="no-flowers">You need to watch someone to find jobs!</p>';
            }
            populatePostCards(data, containerId)
                .then(() => {
                    window.scrollTo({
                        top: scrollPosition.y,
                        left: scrollPosition.x,
                        behavior: 'instant'
                    });
                });
            populateFeedLock = false;
        })
        .catch(() => {
            
            const cachedData = localStorage.getItem("feed");
            if (cachedData) {
                const containerId = "feed-items";
                const data = JSON.parse(cachedData);
                document.getElementById(containerId).textContent = "";
                populatePostCards(data, containerId);
            } else {
                console.error("No cached data available");
            }
            populateFeedLock = false;
        });
};