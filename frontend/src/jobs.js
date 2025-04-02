
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

        const createTimeText = createInfoTextElement("Post time: " + formatTime(item.createdAt), "card-text text-muted");
        extraInfo.appendChild(createTimeText);
        const startingDateText = createInfoTextElement("Starting date: " + formatTime(item.start), "card-text text-muted");

        extraInfo.appendChild(startingDateText);
        const actionsRow = document.createElement("div");
        actionsRow.className = "d-flex justify-content-start align-items-center mt-2 actions-row";
        cardBody.appendChild(actionsRow);

        
        if (containerId === "feed-items") {
            
            const likeButton = document.createElement("button");
            likeButton.className = "btn btn-outline-primary btn-sm me-2 like-button";
            actionsRow.appendChild(likeButton);
            const likeIcon = document.createElement("i"); 
            likeIcon.className = "fas fa-thumbs-up";
            likeButton.appendChild(likeIcon);
            const likeText = document.createTextNode(" Like ");
            likeButton.appendChild(likeText);
            const likeBadge = document.createElement("span");
            likeBadge.className = "badge bg-danger like-badge";
            likeBadge.textContent = item.likes.length;
            likeButton.appendChild(likeBadge);
            likeBadge.addEventListener("click", (event) => {
                event.stopPropagation(); 
                
                const likedBy = item.likes.map(user => user.userId)
                popupLikeList(likedBy);
            });
            const currentUserId = localStorage.getItem("userId");
            const userHasLiked = item.likes.find(user => user.userId == currentUserId);
            toggleLikeButton(likeButton, userHasLiked);
            likeButton.addEventListener('click', () => {
                const liked = item.likes.find(user => user.userId == currentUserId);
                if (liked) {
                    apiCall(`job/like`, "PUT", { "id": item.id, "turnon": false }).then(() => {
                        
                        populateFeed();
                    })
                    .catch(() => {
                        showErrorPopup("No internet connection");
                    });
                } else {
                    apiCall(`job/like`, "PUT", { "id": item.id, "turnon": true }).then(() => {
                        
                        populateFeed();
                    })
                    .catch(() => {
                        showErrorPopup("No internet connection");
                    });
                }
            });

            
            const commentButton = document.createElement("button");
            commentButton.className = "btn btn-outline-secondary btn-sm comment-button";
            actionsRow.appendChild(commentButton);
            const commentIcon = document.createElement("i");
            commentIcon.className = "fas fa-comment";
            commentButton.appendChild(commentIcon);
            const commentText = document.createTextNode(" Comments ");
            commentButton.appendChild(commentText);
            const commentBadge = document.createElement("span");
            commentBadge.className = "badge bg-secondary";
            commentBadge.textContent = item.comments.length;
            commentButton.appendChild(commentBadge);
            commentButton.addEventListener("click", () => {
                
                document.getElementById("comment-input").value = "";
                
                popupCommentList(item.comments, item.id);
            });
        }

        
        if (containerId === "user-jobs" && item.creatorId == localStorage.getItem("userId")) {
            const updateButton = document.createElement("button");
            updateButton.className = "btn btn-outline-primary btn-sm me-2 like-button";
            actionsRow.appendChild(updateButton);
            const updateText = document.createTextNode(" Edit ");
            updateButton.appendChild(updateText);
            updateButton.addEventListener("click", () => {
                currentJobId = item.id;
                showPopup("add-job-popup");
                
                document.getElementById("add-job-popup-title").textContent = "Edit Job";
                document.getElementById("job-title").value = item.title;
                document.getElementById("job-description").value = item.description;
                document.getElementById("job-start-date").value = item.start;
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-outline-danger btn-sm";
            actionsRow.appendChild(deleteButton);
            const deleteText = document.createTextNode(" DELETE ");
            deleteButton.appendChild(deleteText);
            deleteButton.addEventListener("click", () => {
                apiCall(`job`, "DELETE", { "id": item.id })
                    .then(() => {
                        
                        const currentUserId = localStorage.getItem("userId");
                        return populateUserInfo(currentUserId);
                    })
                    .then((newUserData) => {
                        document.getElementById("user-jobs").textContent = "";
                        populatePostCards(newUserData.jobs, "user-jobs");
                    })
            });
        }

        return creatorTextPromise.then((creatorText) => {
            extraInfo.appendChild(creatorText);
            if (containerId === "feed-items") {
                creatorText.addEventListener("click", () => {
                    show("page-profile");
                    hide("section-logged-in");;
                    show("nav-feed");
                    hide("nav-profile");

                    populateUserInfo(item.creatorId)
                        .then((data) => {
                            document.getElementById(containerId).textContent = "";
                            populatePostCards(data.jobs, "user-jobs");
                            populateWatchees(data);
                        });
                });
            }
            document.getElementById(containerId).appendChild(feedDom);
        });
    });

    return Promise.all(cardPromises);
};


const updateJob = () => {
    const title = document.getElementById("job-title").value;
    const startDate = document.getElementById("job-start-date").value;
    const description = document.getElementById("job-description").value;
    const imageFile = document.getElementById("job-image").files[0];

    if (title && startDate && description && imageFile) {
        return fileToDataUrl(imageFile)
            .then((imageData) => {
                const requestBody = {
                    "title": title,
                    "image": imageData,
                    "start": startDate,
                    "description": description
                };

                let response;
                if (currentJobId === -1) { 
                    return apiCall("job", "POST", requestBody).then((resp) => {
                        response = resp;
                        if (response) {
                            
                            document.getElementById("add-job-popup").style.display = "none";
                            populateFeed();
                            
                            populateUserInfo(localStorage.getItem("userId"))
                            .then((newUserData) => {
                                document.getElementById("user-jobs").textContent = "";
                                populatePostCards(newUserData.jobs, "user-jobs");
                            });
                        } else {
                            
                            showErrorPopup(response.error);
                            console.error(`Error: ${response.error}`);
                        }
                    });
                } else { 
                    requestBody.id = currentJobId;
                    return apiCall("job", "PUT", requestBody).then((resp) => {
                        response = resp;
                        if (response) {
                            
                            document.getElementById("add-job-popup").style.display = "none";
                            populateFeed();
                            
                            populateUserInfo(localStorage.getItem("userId"))
                            .then((newUserData) => {
                                document.getElementById("user-jobs").textContent = "";
                                populatePostCards(newUserData.jobs, "user-jobs");
                            });
                        } else {
                            
                            showErrorPopup(response.error);
                            console.error(`Error: ${response.error}`);
                        }
                    });
                }
            });
    } else {
        showErrorPopup("Missing fields");
    }
};


const getCreatorUsername = (id) => {
    return apiCall(`user`, "GET", { userId: id })
        .then((data) => {
            localStorage.setItem(`user_${id}`, JSON.stringify(data.name));
            return data.name;
        })
        .catch(() => { 
            const cachedData = localStorage.getItem(`user_${id}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return "Unknown";
        });
};

const formatTime = (createAt) => {
    const now = new Date();
    const createdDate = new Date(createAt);
    const diffInMs = now - createdDate;
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
        const hours = Math.floor(diffInHours);
        const minutes = Math.floor(diffInMinutes % 60);
        return `${hours} hours ${minutes} minutes ago`;
    } else {
        const day = createdDate.getDate();
        const month = createdDate.getMonth() + 1;
        const year = createdDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};


const createInfoTextElement = (text, className) => {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
};


const toggleLikeButton = (button, liked) => {
    if (liked) {
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-primary');
    } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-primary');
    }
};


const showPopup = (id) => {
    document.getElementById(id).style.display = "block";
};

const popupLikeList = (likedBy) => {
    const likeList = document.getElementById("like-list");

    likedBy.forEach(userId => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        const listItemSpan = document.createElement("span");
        getUsernameById(userId).then((name) => {
            listItemSpan.textContent = name;
        });

        listItem.appendChild(listItemSpan);
        likeList.appendChild(listItem);

        listItem.addEventListener("click", () => {
            show("page-profile");
            hide("section-logged-in");;
            show("nav-feed");
            hide("nav-profile");

            document.getElementById("like-list-popup").style.display = "none";
            
            const likeList = document.getElementById("like-list");
            while (likeList.firstChild) {
                likeList.removeChild(likeList.firstChild);
            }

            
            populateUserInfo(userId)
                .then((data) => {
                    populatePostCards(data.jobs, "user-jobs");
                    populateWatchees(data);
                });
        });
    });

    showPopup("like-list-popup");
};


const popupCommentList = (comments, postId) => {
    const commentList = document.getElementById("comment-list");

    comments.forEach(comment => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        const listItemSpan = document.createElement("span");
        listItemSpan.textContent = comment.userName + ': ' + comment.comment;
        listItem.appendChild(listItemSpan);

        listItem.addEventListener("click", () => {
            show("page-profile");
            hide("section-logged-in");;
            show("nav-feed");
            hide("nav-profile");

            document.getElementById("comment-list-popup").style.display = "none";
            
            const commentList = document.getElementById("comment-list");
            while (commentList.firstChild) {
                commentList.removeChild(commentList.firstChild);
            }

            populateUserInfo(comment.userId)
                .then((data) => {
                    document.getElementById("feed-items").textContent = "";
                    populatePostCards(data.jobs, "user-jobs");
                    populateWatchees(data);
                });
        });

        commentList.appendChild(listItem);
    });


    const oldCommentButton = document.getElementById("comment-button");
    const newCommentButton = oldCommentButton.cloneNode(true);
    oldCommentButton.parentNode.replaceChild(newCommentButton, oldCommentButton);

    newCommentButton.addEventListener("click", () => {
        const inputComment = document.getElementById("comment-input").value;
        if (inputComment) {
            apiCall(`job/comment`, "POST", { "id": postId, "comment": inputComment })
                .catch(() => { 
                    showErrorPopup("No internet connection.");
                    return;
                });
            document.getElementById("comment-input").value = "";
        } else {
            showErrorPopup("Please enter a comment.");
            return;
        }
        
        apiCall('job/feed?start=0', "GET", { "id": postId }).then((data) => {
            document.getElementById("comment-list-popup").style.display = "none";
            
            const commentList = document.getElementById("comment-list");
            while (commentList.firstChild) {
                commentList.removeChild(commentList.firstChild);
            }
            const updatedComments = data.find((item) => item.id === postId).comments;
            popupCommentList(updatedComments, postId);
        });
    });

    showPopup("comment-list-popup");
};

document.getElementById("like-close-btn").addEventListener("click", () => {
    document.getElementById("like-list-popup").style.display = "none";
    
    const likeList = document.getElementById("like-list");
    while (likeList.firstChild) {
        likeList.removeChild(likeList.firstChild);
    }
});

document.getElementById("comment-close-btn").addEventListener("click", () => {
    document.getElementById("comment-list-popup").style.display = "none";
    
    const commentList = document.getElementById("comment-list");
    while (commentList.firstChild) {
        commentList.removeChild(commentList.firstChild);
    }
});

document.getElementById("nav-add-job").addEventListener("click", () => {
    currentJobId = -1;
    document.getElementById("add-job-popup-title").textContent = "Add a New Job";
    showPopup("add-job-popup");
});

document.getElementById("add-job-submit").addEventListener("click", () => {
    updateJob().then(() => {
        
        const currentUserId = localStorage.getItem("userId");
        populateUserInfo(currentUserId)
            .then((newUserData) => {
                populateFeed(newUserData.jobs, "user-jobs");
                populateWatchees(newUserData);
            });

        
        document.getElementById("add-job-popup").style.display = "none";
        document.getElementById("job-title").value = "";
        document.getElementById("job-start-date").value = "";
        document.getElementById("job-description").value = "";
        document.getElementById("job-image").value = "";
    });
});

document.getElementById("add-job-close-btn").addEventListener("click", () => {
    document.getElementById("add-job-popup").style.display = "none";
    document.getElementById("job-title").value = "";
    document.getElementById("job-start-date").value = "";
    document.getElementById("job-description").value = "";
    document.getElementById("job-image").value = "";
});

document.getElementById("nav-feed").addEventListener("click", () => {
    show("page-feed");
    show("section-logged-in");
    hide("page-profile");
    show("nav-profile");
    populateFeed();
    show("watch-user-button");
    // hide("nav-feed");
    
});