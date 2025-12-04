// ==UserScript==
// @name         ERP JobApplication Visited Marker
// @namespace    https://digitecgalaxus.ch/
// @version      1.4
// @description  Mark ERP JobApplication profiles as visited and gray them out in the dashboard
// @match        https://erp.digitecgalaxus.ch/*/JobApplication*
// @updateURL    https://raw.githubusercontent.com/sebastianzillessen/dg-tampermonkey/refs/heads/main/dg-erp-jobdashboard-mark-visited.user.js
// @downloadURL  https://raw.githubusercontent.com/sebastianzillessen/dg-tampermonkey/refs/heads/main/dg-erp-jobdashboard-mark-visited.user.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const url = window.location.href;

    // --- Helpers ---
    function getVisited() {
        return JSON.parse(localStorage.getItem("visitedErpJobProfiles") || "[]");
    }

    function saveVisited(list) {
        localStorage.setItem("visitedErpJobProfiles", JSON.stringify(list));
    }

    function getMarkedForMe() {
        return JSON.parse(localStorage.getItem("myErpJobProfiles") || "[]");
    }

    function saveMarkedForMe(list) {
        localStorage.setItem("myErpJobProfiles", JSON.stringify(list));
    }

    function markVisitedLinks() {
        const visited = new Set(getVisited());
        const markedForMe = new Set(getMarkedForMe());

        // mark all visited links and clean inexistent ones
        for (const visitedId of visited) {
            const link = document.querySelector(`a[href*="/JobApplication/${visitedId}"]`);
            if (link) {
                const row = link.closest("tr");
                row.style.opacity = "0.2";
                row.title = "Was marked as 'visited' with the tempermonkey extension";
            } else {
                visited.delete(visitedId);
                saveVisited(Array.from(visited));
            }
        }

        // mark all marked-for-me links and clean inexistent ones
        for (const markedId of markedForMe) {
            const link = document.querySelector(`a[href*="/JobApplication/${markedId}"]`);
            if (link) {
                const row = link.closest("tr");
                row.style.backgroundColor = "yellow";
                row.title = "Was marked as 'important' with the tempermonkey extension";
            } else {
                markedForMe.delete(markedId);
                saveMarkedForMe(Array.from(markedForMe));
            }
        }
    }

    // --- Case 1: Individual job profile page ---
    const profileMatch = url.match(/JobApplication\/(\d+)/);
    if (profileMatch) {
        const id = profileMatch[1];
        const visited = getVisited();
        const markedForMe = getMarkedForMe();
        const isVisited = visited.includes(id);
        const isMarked = markedForMe.includes(id);

        // Create toggle button
        const btnVisited = document.createElement("button");
        btnVisited.textContent = isVisited
            ? "✅ Marked as Visited"
            : "Mark as Visited";
        Object.assign(btnVisited.style, {
            position: "fixed",
            bottom: "20px",
            right: "250px",
            width: "100px",
            zIndex: 9999,
            padding: "8px 14px",
            background: isVisited ? "#777" : "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
        });

        btnVisited.addEventListener("click", () => {
            let list = getVisited();
            if (list.includes(id)) {
                list = list.filter((x) => x !== id);
                btnVisited.textContent = "Mark as Visited (for me)";
                btnVisited.style.background = "#0078d4";
            } else {
                list.push(id);
                btnVisited.textContent = "✅ Marked as Visited (for me)";
                btnVisited.style.background = "#777";
            }
            saveVisited(list);
        });
        document.body.appendChild(btnVisited);

        const btnMe = document.createElement("button");
        btnMe.textContent = isMarked ? "⚠️ Interested in" : "Mark as interested";
        Object.assign(btnMe.style, {
            position: "fixed",
            bottom: "20px",
            right: "375px",
            width: "100px",
            zIndex: 9999,
            padding: "8px 14px",
            background: isMarked ? "#777" : "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
        });

        btnMe.addEventListener("click", () => {
            let list = getMarkedForMe();
            if (list.includes(id)) {
                list = list.filter((x) => x !== id);
                btnMe.textContent = "Mark as interested";
                btnMe.style.background = "#0078d4";
            } else {
                list.push(id);
                btnMe.textContent = "⚠️ Interested in";
                btnMe.style.background = "#777";
            }
            saveMarkedForMe(list);
        });
        document.body.appendChild(btnMe);
    }

    // --- Case 2: Dashboard page ---
    else if (
        url.includes("/JobApplicationDashboard") ||
        url.includes("/ListAllPendingJobApplications")
    ) {
        // Observe DOM changes if content loads dynamically
        const observer = new MutationObserver(markVisitedLinks);
        observer.observe(document.body, { childList: true, subtree: true });

        markVisitedLinks();
    }
})();
