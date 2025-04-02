
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

    
    // const userId = localStorage.getItem("userId");
    // populateUserInfo(userId)
    //     .then((data) => {
            
    //         const jobs = data.jobs;
    //         const containerId = "user-jobs";
    //         document.getElementById(containerId).textContent = "";
    //         populatePostCards(jobs, containerId);

            
    //         populateWatchees(data);
    //     });
});
const showPopup = (id) => {
    document.getElementById(id).style.display = "block";
};

document.getElementById("edit-profile-button").addEventListener("click", () => {

    document.getElementById("edit-profile-popup-title").textContent = "Edit Profile";
    showPopup("edit-profile-popup");
});

document.getElementById("edit-profile-close-btn").addEventListener("click", () => {
    document.getElementById("edit-profile-popup").style.display = "none";
    document.getElementById("profile-email").value = "";
    document.getElementById("profile-name").value = "";
    document.getElementById("profile-password").value = "";
    document.getElementById("profile-image").value = "";
});

const updateProfile = () => {
    const email = document.getElementById("profile-email").value;
    const name = document.getElementById("profile-name").value;
    const password = document.getElementById("profile-password").value;
    const imageFile = document.getElementById("profile-image").files[0];

    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    
    if (!emailValidator(email)) {
        showErrorPopup("Email format should be: example@domain.com");
        return false;
    }
    userEmail.textContent = `${email}`;

    if (!passwordValidator(password)) {
        showErrorPopup("Password should be at least 8 characters long and contain at least one uppercase letter and one number");
        return false;
    }

    if (!nameValidator(name)) {
        showErrorPopup("Name should be between 2 and 30 characters");
        return false;
    }
    userName.textContent = `${name}`;

    if (email && name && password && imageFile) {
        return fileToDataUrl(imageFile)
            .then((imageData) => {
                userAvatar.style.backgroundImage = `url(${imageData})`;

                const requestBody = {
                    "email": email,
                    "image": imageData,
                    "name": name,
                    "password": password
                };

                return apiCall("user", "PUT", requestBody)
                    .then((data) => {
                        showInfoPopup('update successful!');
                    })
                    .catch((error) => {
                        showErrorPopup(error);
                    });
            });
    } else {
        showErrorPopup("Missing fields");
    }
};

document.getElementById("edit-profile-submit").addEventListener("click", () => {
    updateProfile().then(() => {
        
        const currentUserId = localStorage.getItem("userId");
        populateUserInfo(currentUserId)
            .then((newUserData) => {
                populateFeed(newUserData.jobs, "user-jobs");
                populateWatchees(newUserData);
            });

        
        document.getElementById("edit-profile-popup").style.display = "none";
        document.getElementById("profile-title").value = "";
        document.getElementById("profile-name").value = "";
        document.getElementById("profile-password").value = "";
        document.getElementById("profile-image").value = "";
    });
});

document.getElementById("watch-button").addEventListener("click", () => {
    const currentUserId = document.getElementById("user-id").textContent.slice(1); 
    const turnon = (document.getElementById("watch-button").textContent === "watch") ? true : false;

    const payload = {
        id: currentUserId,
        turnon: turnon,
    };
    apiCall("user/watch", "PUT", payload);
    populateFeed();
    populateUserInfo(currentUserId)
        .then((data) => {
            
            const jobs = data.jobs;
            const containerId = "user-jobs";
            document.getElementById(containerId).textContent = "";
            populatePostCards(jobs, containerId);

            
            populateWatchees(data);
        });
});

document.getElementById("watch-user-button").addEventListener("click", () => {
    const targetUserEmail = prompt("Enter the email of the user:");
    if (!emailValidator(targetUserEmail)) {
        showErrorPopup("Email format should be: example@domain.com");
        return;
    }

    const payload = {
        email: targetUserEmail,
        turnon: true,
    };
    apiCall("user/watch", "PUT", payload);
});

document.getElementById("login-cancel").addEventListener("click", () => {
    hide("page-login");
});
document.getElementById("register-cancel").addEventListener("click", () => {
    hide("page-register");
});