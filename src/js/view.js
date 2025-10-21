/**
 * @fileoverview Chat Web Component with Graceful Degradation
 * Advanced web component implementation with shadow DOM and graceful degradation support
 * @author Jenner Dulce
 * @version 1.0.0
 */

/**
 * ChatInterface Web Component
 * A custom HTML element that provides an interactive chat interface
 * with shadow DOM encapsulation and graceful degradation
 * @extends HTMLElement
 */
class ChatInterface extends HTMLElement {
    /**
     * Creates an instance of ChatInterface
     * Initializes shadow DOM and debug settings
     */
    constructor() {
        super();
        this.elements = {
            messageContainer: document.getElementById('message-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearChatButton: document.getElementById('clear-chat-btn'),
            exportChatButton: document.getElementById('export-chat-btn'),
            importChatButton: document.getElementById('import-chat-btn'),
        }

        /** @type {boolean} Debug flag for console logging */
        this.DEBUG = false;
    }

    /**
     * Called when the element is inserted into the DOM
     * Initializes the component's render, state, and event listeners
     * @returns {void}
     */
    connectedCallback() {
        this.render();
        this.updateSendButtonState();
        this.setupEventListeners();
    }

    /**
     * Logs messages to console when DEBUG is enabled
     * @param {string} msg - The message to log
     * @returns {void}
     */
    log(msg) {
        if (this.DEBUG) console.log(msg);
    }

    setupEventListeners() {

        this.elements.sendBtn.addEventListener('click', () => {
            this.log("Send button clicked");
            let userMessage = this.processUserMessage(userInput.value);
            if (userMessage) {
                this.appendMessageToChat(userMessage, 'user');
                userInput.value = '';
                this.appendMessageToChat(userMessage, 'bot');
            } else {
                alert("Please enter a valid message.");
            }
            this.updateSendButtonState(); // Update button state after sending
        });

        // Clear Chat
        this.elements.clearChatButton.addEventListener('click', () => {

        })

        // Export Chat
        this.elements.exportChatButton.addEventListener('click', () => {

        })

        // Import Chat
        this.elements.importChatButton.addEventListener('click', () => {

        })


        // Listen for input changes (typing, pasting, deleting)
        userInput.addEventListener('input', () => this.updateSendButtonState());

        // Handle Enter key press
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    /**
     * Appends a new message to the chat container
     * Creates and styles message elements, generates bot responses
     * @param {string} message - The message content to display
     * @param {'user'|'bot'} sender - The type of sender (user or bot)
     * @returns {void}
     */
    appendMessageToChat(message, sender) {
        const messageContainer = this.document.getElementById('message-container');

        this.log("Appending Message to Chatbox")
        let newMessageElement = this.document.createElement('li');
        if (sender === 'user') {
            newMessageElement.classList.add('user-message');
            newMessageElement.innerHTML = message;
            messageContainer.appendChild(newMessageElement);

        } else {

            newMessageElement.classList.add('bot-output');
            let botResponse = this.getBotResponse(message);
            newMessageElement.innerHTML = botResponse;
            messageContainer.appendChild(newMessageElement);
        }

        // Scroll to the bottom of the chat
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    updateMessageInChat(message) {

    }

    removeMessageFromChat(message) {

    }

    /**
     * Processes and validates user input message
     * @param {string} msg - Raw user input message
     * @returns {string|boolean} Processed message if valid, false if invalid
     */
    processUserMessage(msg) {
        this.log("Processing user message...");
        let processedUserMessage = msg.trim();

        if (processedUserMessage !== "") {
            return processedUserMessage;

        } else {
            return false;
        }
    }

    /**
     * Updates the send button's visual state based on input content
     * Adds 'hasContent' class when input has text, removes when empty
     * @returns {void}
     */
    updateSendButtonState() {
        const userInput = this.document.getElementById('user-input');
        const sendBtn = this.document.getElementById('send-btn');

        if (userInput.value.trim() !== '') {
            if (!sendBtn.classList.contains('hasContent')) {
                this.log('added hasContent');
                sendBtn.classList.add('hasContent');
            }
        } else {
            if (sendBtn.classList.contains('hasContent')) {
                this.log('removed hasContent');
                sendBtn.classList.remove('hasContent');
            }
        }
    }



    /**
     * Renders the component's HTML structure and styles
     * Sets up the shadow DOM with CSS imports and chat interface
     * @returns {void}
     */
    render() {
        this.innerHTML = `
            <div id="chat-box">
                <div id="chat-box-header-container">
                    <h3 id="chat-box-title">Chat Assistant</h3>
                    <h4 id="chat-box-desc">Interactive Graceful Degredation and Showbox Encapsulation</h4>
                </div>
                <div id="chat-box-functions-container">
                    <button id="export-chat-btn">📤 Export Chat</button>
                    <button id="import-chat-btn">📥 Import Chat</button>
                    <button id="clear-chat-btn">🗑️ Clear Chat</button>
                </div>
                <ul id="message-container">
                    <li class="bot-output">
                        <div class="chat-message-content">
                            <p>Hello! I'm here to chat with you. How can I help you</p>
                        </div>
                    </li>
                </ul>
                <div id="user-input-container">
                    <textarea name="" id="user-input" placeholder="Type a message..."></textarea>
                    <button id="send-btn" type="submit">Send</button>
                </div>
                <div id="chat-box-footer">
                    <!-- <p id="chat-box-footer-text">Chat Prototype - Jenner Dulce &copy; 2024</p> -->
                    <p id="chat-box-footer-text">
                        <span id="info-icon">&#8505;</span>This is a static HTML/CSS demonstration. The input is disabled. See
                        other
                        approaches for interactive versions.
                    </p>
                </div>
            </div>
        `;
    }
}

/**
 * Register the ChatInterface as a custom HTML element
 * Allows usage as <simple-chat></simple-chat> in HTML
 * @type {void}
 */
customElements.define('simple-chat', ChatInterface);