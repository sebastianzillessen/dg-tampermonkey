// ==UserScript==
// @name         ERP JobApplication Visited Marker
// @namespace    https://digitecgalaxus.ch/
// @version      1.1
// @updateUrl    
// @description  Mark ERP JobApplication profiles as visited and gray them out in the dashboard
// @match        https://erp.digitecgalaxus.ch/de/JobApplication*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const url = window.location.href;

    // --- Helpers ---
    function getVisited() {
        return JSON.parse(localStorage.getItem('visitedErpJobProfiles') || '[]');
    }

    function saveVisited(list) {
        localStorage.setItem('visitedErpJobProfiles', JSON.stringify(list));
    }

    // --- Case 1: Individual job profile page ---
    const profileMatch = url.match(/JobApplication\/(\d+)/);
    if (profileMatch) {
        const id = profileMatch[1];
        const visited = getVisited();
        const isVisited = visited.includes(id);

        // Create toggle button
        const btn = document.createElement('button');
        btn.textContent = isVisited ? '✅ Marked as Visited' : 'Mark as Visited';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '8px 14px',
            background: isVisited ? '#777' : '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
        });

        btn.addEventListener('click', () => {
            let list = getVisited();
            if (list.includes(id)) {
                list = list.filter(x => x !== id);
                btn.textContent = 'Mark as Visited (for me)';
                btn.style.background = '#0078d4';
            } else {
                list.push(id);
                btn.textContent = '✅ Marked as Visited (for me)';
                btn.style.background = '#777';
            }
            saveVisited(list);
        });
        document.body.appendChild(btn);
    }

    // --- Case 2: Dashboard page ---
    else if (url.includes('/JobApplicationDashboard')) {
        const visited = getVisited();

        // Observe DOM changes if content loads dynamically
        const observer = new MutationObserver(() => markVisitedLinks());
        observer.observe(document.body, { childList: true, subtree: true });

        markVisitedLinks();

        function markVisitedLinks() {
            // Adapt this selector if necessary – looks for links like /JobApplication/123456
            const links = document.querySelectorAll('a[href*="/JobApplication/"]');

            links.forEach(link => {
                const match = link.href.match(/JobApplication\/(\d+)/);
                if (match && visited.includes(match[1])) {
                    const row = link.closest('tr');
                    row.style.opacity = '0.2';
                    row.style.pointerEvents = 'none';
                }
            });
        }
    }
})();
