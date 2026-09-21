/* 
 * Lab 2 - JSON, Object Constructor, localStorage
 * Student: Son Bui
 * Disclosure: AI assistance used for code structuring, storage synchronization, and review.
 */

import { STRINGS } from "../lang/messages/en/user.js";

class Note {
    constructor(initialValue, onRemove) {
        this.onRemove = onRemove;
        this.container = document.createElement("div");
        this.textarea = document.createElement("textarea");
        this.removeBtn = document.createElement("button");

        this.initDOM(initialValue);
    }

    initDOM(initialValue) {
        this.container.className = "note-row";

        this.textarea.className = "note-textarea";
        this.textarea.value = initialValue;

        this.removeBtn.className = "btn-remove";
        this.removeBtn.textContent = STRINGS.BTN_REMOVE;
        this.removeBtn.addEventListener("click", () => this.remove());

        this.container.appendChild(this.textarea);
        this.container.appendChild(this.removeBtn);
    }

    getValue() {
        return this.textarea.value;
    }

    remove() {
        // Remove from DOM immediately
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        // Notify writer manager to update array and write to localStorage immediately
        this.onRemove(this);
    }
}

class WriterManager {
    constructor() {
        this.notes = [];
        this.statusDisplay = document.getElementById("status-time");
        this.notesList = document.getElementById("notes-list");
        this.addBtn = document.getElementById("add-btn");
        this.backBtn = document.getElementById("back-btn");

        this.initUI();
        this.loadExistingNotes();
        this.startAutoSaveTimer();
    }

    initUI() {
        this.addBtn.textContent = STRINGS.BTN_ADD;
        this.backBtn.textContent = STRINGS.BTN_BACK;

        this.addBtn.addEventListener("click", () => {
            this.createNote("");
        });
    }

    createNote(text) {
        const note = new Note(text, (removedNote) => {
            this.handleNoteRemoved(removedNote);
        });
        this.notes.push(note);
        this.notesList.appendChild(note.container);
    }

    handleNoteRemoved(noteInstance) {
        const index = this.notes.indexOf(noteInstance);
        if (index > -1) {
            this.notes.splice(index, 1);
        }
        // Save immediately upon removal as required by instructions
        this.saveToStorage();
    }

    loadExistingNotes() {
        const rawData = localStorage.getItem(STRINGS.STORAGE_KEY);
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                if (Array.isArray(parsed)) {
                    parsed.forEach((noteData) => {
                        this.createNote(noteData.content || "");
                    });
                }
            } catch (err) {
                console.error("Error parsing local storage notes:", err);
            }
        }
    }

    saveToStorage() {
        const notesPayload = this.notes.map((note) => ({
            content: note.getValue()
        }));

        localStorage.setItem(STRINGS.STORAGE_KEY, JSON.stringify(notesPayload));

        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.statusDisplay.textContent = `${STRINGS.LABEL_STORED_AT}${timeString}`;
    }

    startAutoSaveTimer() {
        // Auto-saves every 2 seconds
        setInterval(() => {
            this.saveToStorage();
        }, 2000);
    }
}

new WriterManager();