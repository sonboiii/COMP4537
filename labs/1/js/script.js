/* 
 * Lab 1 - Memory Game
 * Student: Son Bui
 * ID: A01450344
 * Disclosure: AI assistance used for code structuring, debugging, and review.
 */

import { STRINGS } from "../lang/messages/en/user.js";

class MemoryButton {
    constructor(order, clickCallback) {
        this.order = order;
        this.clickCallback = clickCallback;
        this.color = this.generateRandomColor();
        this.element = document.createElement("button");
        this.initDOM();
    }

    initDOM() {
        this.element.className = "memory-btn";
        this.element.style.backgroundColor = this.color;
        this.element.textContent = this.order;
        this.element.disabled = true;
        this.element.addEventListener("click", () => {
            this.clickCallback(this);
        });
    }

    generateRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    setPosition(x, y) {
        this.element.style.position = "absolute";
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    hideNumber() {
        this.element.textContent = "";
    }

    revealNumber() {
        this.element.textContent = this.order;
    }

    setClickable(isClickable) {
        this.element.disabled = !isClickable;
    }
}

class GameEngine {
    constructor(uiManager) {
        this.ui = uiManager;
        this.buttons = [];
        this.expectedOrder = 1;
        this.totalButtons = 0;
        this.scrambleTimer = null;
    }

    start(count) {
        this.reset();
        this.totalButtons = count;

        for (let i = 1; i <= count; i++) {
            const button = new MemoryButton(i, (clickedButton) => this.handleButtonClick(clickedButton));
            this.buttons.push(button);
            this.ui.renderButton(button.element);
        }

        this.scrambleTimer = setTimeout(() => {
            this.runScrambleLoop(1);
        }, count * 1000);
    }

    runScrambleLoop(iteration) {
        this.scramblePosition();

        if (iteration < this.totalButtons) {
            this.scrambleTimer = setTimeout(() => {
                this.runScrambleLoop(iteration + 1);
            }, 2000);
        } else {
            this.scrambleTimer = setTimeout(() => {
                this.buttons.forEach((btn) => {
                    btn.hideNumber();
                    btn.setClickable(true);
                });
            }, 2000);
        }
    }

    scramblePosition() {
        const area = this.ui.getGameAreaDimensions();

        this.buttons.forEach((btn) => {
            const btnWidth = btn.element.offsetWidth;
            const btnHeight = btn.element.offsetHeight;

            const maxX = Math.max(0, area.width - btnWidth);
            const maxY = Math.max(0, area.height - btnHeight);

            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            btn.setPosition(randomX, randomY);
        });
    }

    handleButtonClick(btn) {
        if (btn.order === this.expectedOrder) {
            btn.revealNumber();
            btn.setClickable(false);

            if (this.expectedOrder === this.totalButtons) {
                this.ui.displayMessage(STRINGS.MSG_EXCELLENT);
            } else {
                this.expectedOrder++;
            }
        } else {
            this.ui.displayMessage(STRINGS.MSG_WRONG);
            this.revealAllAndEnd();
        }
    }

    revealAllAndEnd() {
        this.buttons.forEach((btn) => {
            btn.revealNumber();
            btn.setClickable(false);
        });
    }

    reset() {
        if (this.scrambleTimer) {
            clearTimeout(this.scrambleTimer);
            this.scrambleTimer = null;
        }
        this.ui.clearGameArea();
        this.ui.clearMessage();
        this.buttons = [];
        this.expectedOrder = 1;
    }
}

class UIManager {
    constructor() {
        this.inputLabel = document.getElementById("input-label");
        this.countInput = document.getElementById("btn-count");
        this.goBtn = document.getElementById("go-btn");
        this.messageDisplay = document.getElementById("message-display");
        this.gameArea = document.getElementById("game-area");
        this.initText();
        this.engine = new GameEngine(this);
        this.bindEvents();
    }

    initText() {
        this.inputLabel.textContent = STRINGS.LABEL_NUM_BUTTONS;
        this.goBtn.textContent = STRINGS.BTN_GO;
    }

    bindEvents() {
        this.goBtn.addEventListener("click", () => {
            const count = parseInt(this.countInput.value, 10);
            if (isNaN(count) || count < 3 || count > 7) {
                this.displayMessage(STRINGS.ERR_INVALID_RANGE);
                return;
            }
            this.engine.start(count);
        });
    }

    renderButton(buttonElement) {
        this.gameArea.appendChild(buttonElement);
    }

    clearGameArea() {
        this.gameArea.innerHTML = "";
    }

    displayMessage(message) {
        this.messageDisplay.textContent = message;
    }

    clearMessage() {
        this.messageDisplay.textContent = "";
    }

    getGameAreaDimensions() {
        return {
            width: this.gameArea.clientWidth,
            height: this.gameArea.clientHeight
        };
    }
}

new UIManager();