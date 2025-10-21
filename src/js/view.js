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
export class SimpleChatView extends EventTarget {
    /**
     * Creates an instance of SimpleChatView
     * Regular component (not web component)
     */
    constructor() {
        super();
        this.elements = {};
        /** @type {boolean} Debug flag for console logging */
        this.DEBUG = false;
        this.container = null;
    }

    /**
     * Initialize the view after rendering
     * @returns {void}
     */
    init() {
        this.cacheElements();
        this.updateSendButtonState();
        this.setupEventListeners();
    }

    /**
     * Cache DOM elements after they're rendered
     */
    cacheElements() {
        this.elements = {
            messageContainer: document.getElementById('message-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearChatButton: document.getElementById('clear-chat-btn'),
            exportChatButton: document.getElementById('export-chat-btn'),
            importChatButton: document.getElementById('import-chat-btn'),
        };
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
        // Send button click
        this.elements.sendButton.addEventListener('click', () => {
            this.log("Send button clicked");
            let userMessage = this.processUserMessage(this.elements.userInput.value);

            if (userMessage) {
                this.dispatchSendMessage(userMessage);
                this.elements.userInput.value = ''; // Clear input
                this.updateSendButtonState(); // Update button state after sending

            } else {
                alert("Please enter a valid message.");

            }
        });

        // Clear Chat
        this.elements.clearChatButton.addEventListener('click', () => {
            this.log("Clear chat clicked");
            if (confirm("Are you sure you want to clear all chat messages? This cannot be undone.")) {
                this.dispatchClearChat();
            }
        });

        // Export Chat
        this.elements.exportChatButton.addEventListener('click', () => {
            this.log("Export chat clicked");
            this.dispatchExportChat();
        });

        // Import Chat
        this.elements.importChatButton.addEventListener('click', () => {
            this.log("Import chat clicked");
            this.openFileImportDialog();
        });

        // Listen for input changes (typing, pasting, deleting)
        this.elements.userInput.addEventListener('input', () => this.updateSendButtonState());

        // Handle Enter key press
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.elements.sendButton.click();
            }
        });
    }

    dispatchSendMessage(message) {
        // Dispatch sendMessage event
        this.dispatchEvent(new CustomEvent('sendMessage', {
            detail: {
                message: message,
                isUser: true
            }
        }));

        // Immediate Bot Resposne
        setTimeout(() => {
            let botResponse = this.getBotResponse(message);
            this.dispatchEvent(new CustomEvent('sendMessage', {
                detail: {
                    message: botResponse,
                    isUser: false
                }
            }));
        }, 2000);
    }

    dispatchClearChat() {
        this.dispatchEvent(new CustomEvent('clearChat', {
            detail: {}
        }));
    }

    dispatchExportChat() {
        this.dispatchEvent(new CustomEvent('exportChat', {
            detail: {}
        }));
    }

    dispatchImportChat(importedData) {
        this.dispatchEvent(new CustomEvent('importChat', {
            detail: { importedData: importedData }
        }));
    }

    openFileImportDialog() {
        // Create a hidden file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.json';
        fileInput.style.display = 'none';
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.readImportFile(file);
            }
        });
        
        // Trigger file dialog
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    readImportFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;
                const importedData = JSON.parse(fileContent);
                this.dispatchImportChat(importedData);
            } catch (error) {
                alert('Error reading file: Invalid JSON format');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    

    /**
     * Appends a new message to the chat container
     * Creates and styles message elements, generates bot responses
     * @param {Object} messageObj - The message object with content and user info
     * @returns {void}
     */
    appendMessageToChat(messageObj, isUser) {
        this.log("Appending Message to Chatbox");

        // Clear input
        this.elements.userInput.value = '';

        let newMessageElement = document.createElement('li');

        if (isUser) {
            newMessageElement.classList.add('user-message');

        } else {
            newMessageElement.classList.add('bot-output');

        }

        newMessageElement.innerHTML = messageObj.message;
        this.elements.messageContainer.appendChild(newMessageElement);

        // Scroll to the bottom of the chat
        this.elements.messageContainer.scrollTop = this.elements.messageContainer.scrollHeight;
    }

    updateMessageInChat(message) {
        // TODO: Implement message update functionality
    }

    removeMessageFromChat(message) {
        // TODO: Implement message removal functionality
    }

    clearChatMessages() {
        const messageContainer = this.elements.messageContainer;
        const messages = messageContainer.querySelectorAll('li');
        
        for (let i = 0; i < messages.length; i++) {
            messages[i].remove();
        }
        
        this.log("Chat messages cleared from UI");
    }

    displayImportedMessages(messages) {
        this.log("Displaying imported messages");
        this.clearChatMessages();
        
        messages.forEach(message => {
            this.appendMessageToChat(message, message.isUser);
        });
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
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');

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
     * Generate a simple bot response (placeholder)
     * @param {string} userMessage - The user's message
     * @returns {string} Bot response
     */
    getBotResponse(userMessage) {
        // Simple bot response logic - can be enhanced later
        const responses = [
            "That's interesting! Tell me more.",
            "I see what you mean.",
            "Thanks for sharing that with me.",
            "How do you feel about that?",
            "That's a great point!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Renders the component's HTML structure and styles
     * Sets up the shadow DOM with CSS imports and chat interface
     * @returns {void}
     */
    render(containerId) {
        const container = document.querySelector(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        container.innerHTML = `
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

        // Initialize after rendering
        this.init();
    }
}
