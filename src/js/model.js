export class SimpleChatModel extends EventTarget {
    constructor() {
        super();
        this.messages = [];
    }



    loadFromStroage() {
        try {

        } catch (error) {

        }
    }

    saveToStorage() {
        try {

        } catch (error) {

        }
    }

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

    updateMessage(messageID, newMessage) {

    }

    deleteMessage(messageId) {

    }

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

    saveToLocalStorage() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.messages));
        } catch (e) {
            console.error(`Error saving to storage: ${e}`)
        }
    }

    //  Custom Events for Dispatching
    dispatchMessageAdded(message) {
        this.dispatchEvent(new CustomEvent('messageAdded', {
            detail: { message }
        }))
    }

    dispatchMessageUpdated(message) {
        this.dispatchEvent(new CustomEvent('messageUpdated', {
            detail: { message }
        }))
    }

    dispatchMessageDeleted(messageId) {
        this.dispatchEvent(new CustomEvent('messageDeleted', {
            detail: { messageId }
        }))
    }

    dispatchChatCleared() {
        this.dispatchEvent(new CustomEvent('chatCleared', {
            detail: {
                message: "Chat has been cleared successfully"
            }
        }));
    }

    dispatchChatExported() {
        this.dispatchEvent(new CustomEvent('chatExported', {
            // Dispatch an Alert

        }))
    }

    dispatchChatImported() {
        this.dispatchEvent(new CustomEvent('chatImported', {
            detail: {
                message: "Chat imported successfully",
                importedMessages: this.messages
            }
        }));
    }
}

