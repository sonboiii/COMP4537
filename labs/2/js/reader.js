/* 
 * Lab 2 - JSON, Object Constructor, localStorage
 * Student: Son Bui
 * Disclosure: AI assistance used for code structuring, storage synchronization, and review.
 */

import { STRINGS } from "../lang/messages/en/user.js";

class ReadOnlyNote {
    constructor(content) {
        this.container = document.createElement("div");
        this.textarea = document.createElement("textarea");
        this.initDOM(content);
    }

    initDOM(content) {
        this.container.className = "note-row";
        this.textarea.className = "note-textarea";
        this.textarea.value = content;
        this.textarea.readOnly = true;

        this.container.appendChild(this.textarea);
    }
}

class ReaderManager {
    constructor() {
        this.statusDisplay = document.getElementById("status-time");
        this.notesList = document.getElementById("notes-list");
        this.backBtn = document.getElementById("back-btn");

        this.initUI();
        this.fetchAndRenderNotes();
        this.startPolling();
    }

    initUI() {
        this.backBtn.textContent = STRINGS.BTN_BACK;
    }

    fetchAndRenderNotes() {
        const rawData = localStorage.getItem(STRINGS.STORAGE_KEY);
        this.notesList.innerHTML = "";

        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                if (Array.isArray(parsed)) {
                    parsed.forEach((noteData) => {
                        const readNote = new ReadOnlyNote(noteData.content || "");
                        this.notesList.appendChild(readNote.container);
                    });
                }
            } catch (err) {
                console.error("Error reading notes from localStorage:", err);
            }
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.statusDisplay.textContent = `${STRINGS.LABEL_UPDATED_AT}${timeString}`;
    }

    startPolling() {
        // Polls every 2 seconds as required by instructions
        setInterval(() => {
            this.fetchAndRenderNotes();
        }, 2000);

        // Immediate tab-to-tab sync if written in an adjacent tab
        window.addEventListener("storage", (event) => {
            if (event.key === STRINGS.STORAGE_KEY) {
                this.fetchAndRenderNotes();
            }
        });
    }
}

new ReaderManager();