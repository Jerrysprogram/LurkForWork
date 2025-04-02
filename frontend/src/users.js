
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



