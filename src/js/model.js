/**
 * Model component for chat application data management
 * Handles CRUD operations, localStorage persistence, and event dispatching
 */
export class SimpleChatModel extends EventTarget {
    /**
     * Create a new SimpleChatModel instance
     */
    constructor() {
        super();
        
        /** @type {Array<Object>} Array of chat messages */
        this.messages = [];
    }


    /**
     * Add a new message to the chat
     * @param {string} messageText - The message content
     * @param {boolean} isUser - Whether the message is from the user
     * @param {boolean} [isEdited=false] - Whether the message has been edited
     */
    addMessage(messageText, isUser, isEdited = false) {
        console.log("Adding message to localStorage: ", messageText);
        const message = {
            id: Date.now().toString() + Math.random(),
            message: messageText,
            isUser: isUser,
            timestamp: new Date().toISOString(),
            isEdited: isEdited
        };

        this.messages.push(message);
        this.saveToLocalStorage();
        this.dispatchMessageAdded(message);
        console.log("Message added: ", message);
    }

    /**
     * Update an existing message
     * @param {string} messageId - The message ID to update
     * @param {string} newMessage - The new message content
     */
    updateMessage(messageId, newMessage) {
        console.log("Model updating message with ID:", messageId, "New text:", newMessage);
        
        // Find message in array
        const messageIndex = this.messages.findIndex(message => message.id === messageId);
        console.log("Found message at index:", messageIndex);
        
        if (messageIndex !== -1) {
            // Update message content and mark as edited
            this.messages[messageIndex].message = newMessage;
            this.messages[messageIndex].isEdited = true;
            this.messages[messageIndex].editedAt = new Date().toISOString();
            
            console.log("Updated message:", this.messages[messageIndex]);
            
            // Update localStorage
            this.saveToLocalStorage();
            
            // Dispatch update event
            this.dispatchMessageUpdated(this.messages[messageIndex]);
            
            console.log(`Message ${messageId} updated successfully`);
        } else {
            console.warn(`Message with ID ${messageId} not found`);
        }
    }

    /**
     * Delete a message by ID
     * @param {string} messageId - The message ID to delete
     */
    deleteMessage(messageId) {
        console.log("Deleting message with ID:", messageId);
        
        // Find and remove message from array
        const messageIndex = this.messages.findIndex(message => message.id === messageId);
        
        if (messageIndex !== -1) {
            // Remove message from array
            this.messages.splice(messageIndex, 1);
            
            // Update localStorage
            this.saveToLocalStorage();
            
            // Dispatch delete event
            this.dispatchMessageDeleted(messageId);
            
            console.log(`Message ${messageId} deleted successfully`);
        } else {
            console.warn(`Message with ID ${messageId} not found`);
        }
    }

    /**
     * Clear all chat messages
     */
    clearChat() {
        console.log("Clearing chat messages on localStorage.. ");
        
        // Clear the messages array
        this.messages = [];
        
        // Remove from localStorage
        try {
            localStorage.removeItem('chatHistory');
            console.log("Chat history removed from localStorage");

        } catch (e) {
            console.error(`Error clearing localStorage: ${e}`);

        }
        
        // Dispatch event to notify that chat was cleared
        this.dispatchChatCleared();
    }

    /**
     * Export chat messages to a file
     */
    exportChat() {
        // Create simple JSON string of messages
        const jsonString = JSON.stringify(this.messages);
    
        // Create and download text file
        const blob = new Blob([jsonString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chat-export.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Chat exported as text file');
    }

    /**
     * Import chat messages from data
     * @param {Array<Object>} importedData - Array of message objects to import
     */
    importChat(importedData) {
        try {
            console.log("Importing chat messages:", importedData);
            
            // Clear current messages
            this.messages = [];
            
            // Import the messages (assuming importedData is an array of messages)
            if (Array.isArray(importedData)) {
                this.messages = importedData;
            } else {
                throw new Error("Invalid data format: expected an array of messages");
            }
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Dispatch events for each imported message to update the UI
            this.messages.forEach(message => {
                this.dispatchMessageAdded(message);
            });
            
            // Dispatch import completion event
            this.dispatchChatImported();
            
            console.log(`Successfully imported ${this.messages.length} messages`);
            
        } catch (error) {
            console.error("Error importing chat:", error);
            alert("Error importing chat: " + error.message);
        }
    }

    /**
     * Save messages to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.messages));
        } catch (e) {
            console.error(`Error saving to storage: ${e}`)
        }
    }

    /**
     * Dispatch message added event
     * @param {Object} message - The message object that was added
     */
    dispatchMessageAdded(message) {
        this.dispatchEvent(new CustomEvent('messageAdded', {
            detail: { message }
        }))
    }

    /**
     * Dispatch message updated event
     * @param {Object} message - The message object that was updated
     */
    dispatchMessageUpdated(message) {
        console.log('Model dispatching messageUpdated event:', message);
        this.dispatchEvent(new CustomEvent('messageUpdated', {
            detail: { message }
        }))
    }

    /**
     * Dispatch message deleted event
     * @param {string} messageId - The ID of the deleted message
     */
    dispatchMessageDeleted(messageId) {
        this.dispatchEvent(new CustomEvent('messageDeleted', {
            detail: { messageId }
        }))
    }

    /**
     * Dispatch chat cleared event
     */
    dispatchChatCleared() {
        this.dispatchEvent(new CustomEvent('chatCleared', {
            detail: {
                message: "Chat has been cleared successfully"
            }
        }));
    }

    /**
     * Dispatch chat exported event
     */
    dispatchChatExported() {
        this.dispatchEvent(new CustomEvent('chatExported', {
            // Dispatch an Alert

        }))
    }

    /**
     * Dispatch chat imported event
     */
    dispatchChatImported() {
        this.dispatchEvent(new CustomEvent('chatImported', {
            detail: {
                message: "Chat imported successfully",
                importedMessages: this.messages
            }
        }));
    }
}

