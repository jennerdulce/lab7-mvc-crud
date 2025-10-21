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
        this.loadChatHistoryFromStorage();
    }

    /**
     * Load chat history from localStorage and display it
     * @returns {void}
     */
    loadChatHistoryFromStorage() {
        try {
            const chatHistory = localStorage.getItem('chatHistory');
            if (chatHistory) {
                const messages = JSON.parse(chatHistory);
                this.log(`Loading ${messages.length} messages from localStorage`);
                this.displayImportedMessages(messages);
            } else {
                this.log('No chat history found in localStorage');
            }
        } catch (error) {
            console.error('Error loading chat history from localStorage:', error);
        }
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

        // Handle message action buttons (edit/delete) - event delegation
        this.elements.messageContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('message-action-btn')) {
                const messageId = e.target.getAttribute('data-message-id');
                const action = e.target.getAttribute('data-action');
                
                if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this message?')) {
                        this.dispatchDeleteMessage(messageId);
                    }
                } else if (action === 'edit') {
                    // TODO: Implement edit functionality
                    console.log('Edit functionality coming soon...');
                }
                
                // Hide actions after clicking
                this.hideAllMessageActions();
            }
        });

        // Handle clicking on user messages to show action buttons
        this.elements.messageContainer.addEventListener('click', (e) => {
            const userMessage = e.target.closest('.user-message-interactive');
            if (userMessage && !e.target.classList.contains('message-action-btn')) {
                this.showMessageActions(userMessage);
            } else if (!userMessage && !e.target.classList.contains('message-action-btn')) {
                // Clicked outside of any user message, hide all actions
                this.hideAllMessageActions();
            }
        });

        // Hide actions when clicking outside the message container
        document.addEventListener('click', (e) => {
            const messageContainer = e.target.closest('#message-container');
            const isActionButton = e.target.classList.contains('message-action-btn');
            const isUserMessage = e.target.closest('.user-message-interactive');
            
            // If clicked outside message container and not on action buttons or user messages
            if (!messageContainer && !isActionButton && !isUserMessage) {
                this.hideAllMessageActions();
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

    dispatchDeleteMessage(messageId) {
        this.dispatchEvent(new CustomEvent('deleteMessage', {
            detail: { messageId: messageId }
        }));
    }

    hideAllMessageActions() {
        const allActions = this.elements.messageContainer.querySelectorAll('.message-actions');
        allActions.forEach(actions => {
            actions.style.display = 'none';
        });
    }

    showMessageActions(messageElement) {
        this.hideAllMessageActions(); // Hide any currently visible actions
        const actions = messageElement.querySelector('.message-actions');
        if (actions) {
            actions.style.display = 'flex';
        }
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
        
        // Add data attribute with message ID
        newMessageElement.setAttribute('data-message-id', messageObj.id);

        if (isUser) {
            newMessageElement.classList.add('user-message');
        } else {
            newMessageElement.classList.add('bot-output');
        }

        // Create message content (no buttons initially)
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const messageText = document.createElement('span');
        messageText.classList.add('message-text');
        messageText.textContent = messageObj.message;
        
        messageContent.appendChild(messageText);
        
        // Only add interactive class and create action buttons for user messages
        if (isUser) {
            newMessageElement.classList.add('user-message-interactive');
            
            // Create action buttons container (initially hidden)
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('message-actions');
            actionsContainer.style.display = 'none';
            
            // Edit button
            const editButton = document.createElement('button');
            editButton.classList.add('message-action-btn');
            editButton.setAttribute('data-action', 'edit');
            editButton.setAttribute('data-message-id', messageObj.id);
            editButton.textContent = '✏️';
            editButton.title = 'Edit message';
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('message-action-btn');
            deleteButton.setAttribute('data-action', 'delete');
            deleteButton.setAttribute('data-message-id', messageObj.id);
            deleteButton.textContent = '🗑️';
            deleteButton.title = 'Delete message';
            
            actionsContainer.appendChild(editButton);
            actionsContainer.appendChild(deleteButton);
            newMessageElement.appendChild(actionsContainer);
        }
        
        newMessageElement.appendChild(messageContent);

        this.elements.messageContainer.appendChild(newMessageElement);

        // Scroll to the bottom of the chat
        this.elements.messageContainer.scrollTop = this.elements.messageContainer.scrollHeight;
    }

    updateMessageInChat(message) {
        // TODO: Implement message update functionality
    }

    removeMessageFromChat(messageId) {
        const messageElement = this.elements.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            this.log(`Message with ID ${messageId} removed from UI`);

        } else {
            console.warn(`Message with ID ${messageId} not found in UI`);
        }
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
