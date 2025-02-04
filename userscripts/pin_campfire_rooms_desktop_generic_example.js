// ==UserScript==
// @name        Campfire Room Pinning (by data-name property)
// @namespace   https://github.com/danwolff/campfire_customization
// @include     https://yoursubdomain.yourcampfiredomain.com/*
// @version     16
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    if (!window.location.hostname.includes("yoursubdomain.yourcampfiredomain.com")) {
        console.log("[DEBUG] Not on yoursubdomain.yourcampfiredomain.com, script will not run.");
        return;
    }

    // Define rooms to pin -- inspect HTML, find data-name properties, list here
    const pinnedRooms = [
        "e-commerce",
        "marketing",
        "podcasters",
        "sales"
    ];

    function createPinnedSection() {
        console.log("[DEBUG] Running createPinnedSection");

        // Locate the correct parent container for the room list
        let mainContainer = document.querySelector('.rooms') ||
            document.querySelector('.main-container') ||
            document.querySelector('[data-controller="rooms-list"]') ||
            document.body;

        if (!mainContainer) {
            console.warn("[ERROR] Main container not found, retrying...");
            setTimeout(createPinnedSection, 1000);
            return;
        }

        console.log("[DEBUG] Main container found:", mainContainer);

        // Ensure "Pinned Rooms" section exists
        let pinnedContainer = document.getElementById("pinned-rooms");
        if (!pinnedContainer) {
            pinnedContainer = document.createElement("div");
            pinnedContainer.id = "pinned-rooms";
            pinnedContainer.style.borderBottom = "0px solid #ccc";
            pinnedContainer.style.marginBottom = "0px";
            pinnedContainer.style.paddingBottom = "0px";
            pinnedContainer.style.paddingTop = "0px";
            pinnedContainer.style.backgroundColor = "#000000"; // black
            pinnedContainer.style.position = "relative";

            // Create a header label for the pinned section
            let pinnedHeader = document.createElement("h1");
            pinnedHeader.textContent = "Pinned Rooms";
            pinnedHeader.className = "txt-small";

            pinnedContainer.appendChild(pinnedHeader);

            // Insert pinned section at the right location
            let inboxElement = document.querySelector('[data-test="inbox-section"]');
            let allRoomsElement = document.querySelector('[data-test="all-rooms-section"]');

            if (inboxElement && allRoomsElement) {
                inboxElement.insertAdjacentElement("afterend", pinnedContainer);
                console.log("[DEBUG] Inserted 'Pinned Rooms' right after 'Inbox'");
            } else {
                mainContainer.insertBefore(pinnedContainer, mainContainer.firstChild);
                console.warn("[WARNING] Inbox/All Rooms not found, inserting at top");
            }
        }

        // Function to move a room to the pinned section
        function pinRoom(roomDataName) {
            let room = document.querySelector(`[data-name="${roomDataName}"]`);
            if (!room) {
                console.warn(`[ERROR] '${roomDataName}' room not found, retrying...`);
                setTimeout(() => pinRoom(roomDataName), 1000);
                return;
            }

            console.log(`[DEBUG] Found '${roomDataName}' room:`, room);

            // Force visibility
            if (room.hasAttribute('hidden')) {
                room.removeAttribute('hidden');
                console.log(`[DEBUG] Removed 'hidden' attribute from '${roomDataName}'`);
            }

            // Move the room to the pinned section
            pinnedContainer.appendChild(room);
            console.log(`[DEBUG] Moved '${roomDataName}' to 'Pinned Rooms'`);

            // Prevent sorting from affecting it
            room.removeAttribute("data-sorted-list-target");
            room.removeAttribute("data-rooms-list-target");
            room.removeAttribute("data-updated-at");

            console.log(`[DEBUG] Removed sorting attributes from '${roomDataName}'`);
        }

        // Loop through the list of pinned rooms and move them
        pinnedRooms.forEach(pinRoom);

        // Watch for Turbo/Stimulus updates that might remove pinned section
        let observer = new MutationObserver(() => {
            if (!document.getElementById("pinned-rooms")) {
                console.warn("[WARNING] 'Pinned Rooms' was removed, recreating...");
                createPinnedSection();
            }
        });

        observer.observe(mainContainer, { childList: true, subtree: true });
    }

    // Run after full page load
    window.addEventListener('load', () => {
        setTimeout(createPinnedSection, 2000);
    });
})();

