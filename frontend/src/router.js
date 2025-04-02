import { hide, show } from "./helpers.js";
import { populatePostCards } from "./jobs.js";
import { populateUserInfo, populateWatchees } from "./users.js";

const routes = {
    "": "",
    "login": "page-login",
    "register": "page-register",
    "profile": "page-profile",
    "feed": "page-feed",
};


export const locationHandler = () => {
    let path = window.location.hash.replace("#", ""); 
    if (path === "") {
        path = "/";
        // hide("section-logged-in");;
    }
    const route = routes[path]; 

    if (path.match(/profile=/)) {
        if (!localStorage.getItem("token")) {
            show("page-login");
            return;
        }
        const userId = path.split("=")[1];
        hide("section-logged-in");;
        hide("nav-profile");
        hide("main-content");
        show("page-profile");
        show("nav-feed");

        populateUserInfo(userId)
            .then((data) => {
        
                const jobs = data.jobs;
                const containerId = "user-jobs";
                document.getElementById(containerId).textContent = "";
                populatePostCards(jobs, containerId);

        
                populateWatchees(data);
            });
    }

    switch (route) {
        case "page-login":
            hide("page-register");
            show("page-login");
            break;
        case "page-register":
            show("page-register");
            hide("page-login");
            break;
        case "page-profile":
            hide("page-login");
            hide("main-content")
            show("page-profile");
            hide("page-feed");
             const userId = localStorage.getItem("userId");
            populateUserInfo(userId)
                .then((data) => {
                    
                    const jobs = data.jobs;
                    const containerId = "user-jobs";
                    document.getElementById(containerId).textContent = "";
                    populatePostCards(jobs, containerId);

                    
                    populateWatchees(data);
                });
            break;
        case "page-feed":
            if (!localStorage.getItem("token")) {
                window.location.hash = "login";
                return;
            }
            hide("main-content");
            show("page-feed");
            hide("page-profile");
            show("nav-profile");
            show("watch-user-button");
            // hide("nav-feed");
            show("section-logged-in");

            break;
    }
}

window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", locationHandler);
locationHandler();
