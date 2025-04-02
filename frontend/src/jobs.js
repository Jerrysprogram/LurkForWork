
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


export const populatePostCards = (data, containerId) => {
    console.log('data', data)
    
    const cardPromises = data.map((item) => {
        const feedDom = document.createElement("div");
        feedDom.className = "card mb-3 feed-card";

        const row = document.createElement("div");
        row.className = "row no-gutters";
        feedDom.appendChild(row);

        const colImg = document.createElement("div");
        colImg.className = "col-md-3";
        row.appendChild(colImg);

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "card-img img-wrapper";
        colImg.appendChild(imgWrapper);
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = `Job Image for ${item.title}`;
        img.className = "job-image";
        img.alt = `Image of ${item.title}`;
        imgWrapper.appendChild(img);

        const colBody = document.createElement("div");
        colBody.className = "col-md-9";
        row.appendChild(colBody);

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        colBody.appendChild(cardBody);

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = item.title;
        cardBody.appendChild(title);

        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = item.description;
        cardBody.appendChild(description);

        const extraInfo = document.createElement("div");
        extraInfo.className = "creator-time-wrapper";
        cardBody.appendChild(extraInfo);

        const creatorTextPromise = getCreatorUsername(item.creatorId)
            .then((creatorName) => {
                const creatorText = createInfoTextElement("Posted by: " + creatorName, "card-text text-muted post-creator-text");
                return creatorText;
            })