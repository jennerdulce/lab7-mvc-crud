/**
 * View component for chat application UI management
 * Handles DOM manipulation, user interactions, and event dispatching
 */
export class SimpleChatView extends EventTarget {
    /**
     * Create a new SimpleChatView instance
     */
    constructor() {
        super();
        
        /** @type {Object} Cache of DOM elements */
        this.elements = {};
        
        /** @type {boolean} Debug logging flag */
        this.DEBUG = false;
        
        /** @type {HTMLElement|null} Container element */
        this.container = null;
    }

    /**
     * Initialize the view component
     */
    init() {
        this.cacheElements();
        this.updateSendButtonState();
        this.setupEventListeners();
        this.loadChatHistoryFromStorage();
    }

    /**
     * Load chat history from localStorage and display it
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
     * Cache DOM elements for efficient access
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

    loadChatHistoryFromStorage() {
        try {
            const storedMessages = localStorage.getItem('chatHistory');
            if (storedMessages) {
                const messages = JSON.parse(storedMessages);
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
     * Log debug messages when DEBUG is enabled
     * @param {string} msg - Message to log
     */
    log(msg) {
        if (this.DEBUG) console.log(msg);
    }

    /**
     * Set up all event listeners for user interactions
     */
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
                    this.startEditingMessage(messageId);
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

    /**
     * Dispatch send message event
     * @param {string} message - The message to send
     */
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

    dispatchEditMessage(messageId, newText) {
        console.log('View dispatching edit message:', messageId, newText);
        this.dispatchEvent(new CustomEvent('editMessage', {
            detail: { messageId: messageId, newText: newText }
        }));
    }

    startEditingMessage(messageId) {
        const messageElement = this.elements.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const messageTextElement = messageElement.querySelector('.message-text');
        if (!messageTextElement) return;

        const currentText = messageTextElement.textContent;
        
        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        textarea.classList.add('edit-textarea');
        textarea.rows = Math.max(2, Math.ceil(currentText.length / 40));
        
        // Create save and cancel buttons
        const editControls = document.createElement('div');
        editControls.classList.add('edit-controls');
        
        const saveButton = document.createElement('button');
        saveButton.textContent = '✓';
        saveButton.classList.add('edit-save-btn');
        saveButton.title = 'Save changes';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '✗';
        cancelButton.classList.add('edit-cancel-btn');
        cancelButton.title = 'Cancel editing';
        
        editControls.appendChild(saveButton);
        editControls.appendChild(cancelButton);
        
        // Replace message text with textarea
        messageTextElement.style.display = 'none';
        messageTextElement.parentNode.appendChild(textarea);
        messageTextElement.parentNode.appendChild(editControls);
        
        // Focus textarea and select all text
        textarea.focus();
        textarea.select();
        
        // Handle save
        const saveEdit = () => {
            const newText = textarea.value.trim();
            console.log('Save edit clicked. Original:', currentText, 'New:', newText);
            
            if (newText && newText !== currentText) {
                console.log('Dispatching edit message...');
                this.dispatchEditMessage(messageId, newText);
            } else if (!newText) {
                alert('Message cannot be empty');
                return; // Don't cancel edit if text is empty
            } else {
                console.log('No changes made to message');
            }
            this.cancelEdit(messageElement);
        };
        
        // Handle cancel
        const cancelEdit = () => {
            this.cancelEdit(messageElement);
        };
        
        // Event listeners
        saveButton.addEventListener('click', saveEdit);
        cancelButton.addEventListener('click', cancelEdit);
        
        // Save on Enter (without Shift), cancel on Escape
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    cancelEdit(messageElement) {
        const textarea = messageElement.querySelector('.edit-textarea');
        const editControls = messageElement.querySelector('.edit-controls');
        const messageText = messageElement.querySelector('.message-text');
        
        if (textarea) textarea.remove();
        if (editControls) editControls.remove();
        if (messageText) messageText.style.display = '';
    }

    updateMessageInChat(messageId, newText) {
        const messageElement = this.elements.messageContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const messageTextElement = messageElement.querySelector('.message-text');
            if (messageTextElement) {
                messageTextElement.textContent = newText;
                
                // Add edited indicator
                let editedIndicator = messageElement.querySelector('.edited-indicator');
                if (!editedIndicator) {
                    editedIndicator = document.createElement('span');
                    editedIndicator.classList.add('edited-indicator');
                    editedIndicator.textContent = ' (edited)';
                    editedIndicator.style.fontSize = '0.7em';
                    editedIndicator.style.opacity = '0.7';
                    messageTextElement.appendChild(editedIndicator);
                }
            }
        }
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
     * Append a message to the chat interface
     * @param {Object} messageObj - The message object
     * @param {boolean} isUser - Whether the message is from the user
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

    processUserMessage(msg) {
        this.log("Processing user message...");
        let processedUserMessage = msg.trim();

        if (processedUserMessage !== "") {
            return processedUserMessage;

        } else {
            return false;
        }
    }

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
