
import { emailValidator, passwordValidator, nameValidator, showErrorPopup } from "./auth.js";
import { populateFeed, populatePostCards } from "./jobs.js";
import { apiCall, show, hide, fileToDataUrl, getUsernameById } from "./helpers.js";


export const populateUserInfo = (userId) => {
    const payload = {
        userId: userId,
    };

    return apiCall("user", "GET", payload)
        .then((data) => {
            const cachedUserID = parseInt(localStorage.getItem("userId"));

            
            const userAvatarElement = document.getElementById("user-avatar");
            userAvatarElement.style.backgroundImage = `url(${data.image})`;
            userAvatarElement.setAttribute("alt", `${data.name}'s Avatar`);

            const userIdElement = document.getElementById("user-id");
            userIdElement.textContent = `#${data.id}`;

            const userNameElement = document.getElementById("user-name");
            userNameElement.textContent = `${data.name}`;

            const userEmailElement = document.getElementById("user-email");
            userEmailElement.textContent = `${data.email}`;

            
            userAvatarElement.classList.add("avatar");
            userIdElement.classList.add("user-info__text");
            userNameElement.classList.add("user-info__text");
            userEmailElement.classList.add("user-info__text");

            
            const watchButton = document.getElementById("watch-button");

            if (userId == cachedUserID) {
                show("edit-profile-button-container");
                hide("watch-button-container");
            } else {
                
                watchButton.textContent = (data.usersWhoWatchMeUserIds.includes(cachedUserID)) ? "unwatch" : "watch";
                show("watch-button-container");
                hide("edit-profile-button-container");
            }
            return data;
        });
};


export const populateWatchees = (data) => {
    const watchees = data.usersWhoWatchMeUserIds;
    const numWatchees = watchees.length;

    
    const numWatcheesElement = document.getElementById("watchees-num");
    numWatcheesElement.textContent = numWatchees;
    numWatcheesElement.style.fontWeight = "bold";

    const watcheesContainer = document.getElementById("user-watchees");
    watcheesContainer.textContent = "";
    for (const watcheeId of watchees) {
        const payload = {
            userId: watcheeId,
        };

        const watcheeElement = document.createElement("div");
        watcheeElement.classList.add("card", "mb-3");
        watcheeElement.style.width = "180px";
        watcheeElement.style.height = "90px";
        watcheeElement.style.margin = "10px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "p-2");

        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title", "mb-1");

        const cardSubtitle = document.createElement("h6");
        cardSubtitle.classList.add("card-subtitle", "text-muted", "mb-1");
        apiCall("user", "GET", payload)
            .then((watcheeInfo) => {
                cardSubtitle.textContent = watcheeInfo.email;
                cardTitle.textContent = watcheeInfo.name;
            });
        const cardButton = document.createElement("button");
        cardButton.classList.add("btn",  "btn-sm");
        cardButton.style.width = "4em";
        cardButton.style.textAlign = "right";
        cardButton.style.position = "absolute";
        cardButton.style.right = "0";
        cardButton.style.bottom = "0";
        cardButton.style.marginLeft = "10px";
        cardButton.textContent = "View";
        cardButton.setAttribute("id", "watchee-card-button");
        cardButton.setAttribute("value", `${watcheeId}`);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        watcheeElement.appendChild(cardButton);
        watcheeElement.appendChild(cardBody);
        watcheesContainer.appendChild(watcheeElement);

        cardButton.addEventListener("click", () => {
            
            populateUserInfo(watcheeId)
                .then((data) => {
                    document.getElementById("user-jobs").textContent = "";
                    populatePostCards(data.jobs, "user-jobs");
                    populateWatchees(data);
                });
        });
    }
};


document.getElementById("nav-profile").addEventListener("click", () => {
    hide("section-logged-in");
    hide("main-content");
    show("page-profile");

