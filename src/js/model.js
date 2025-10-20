class SimpleChatModel extends EventTarget {
    constructor() {
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

    addMessage(message, isUser = false) {

    }

    updateMessage(messageID, newMessage) {

    }

    deleteMessage(messageId) {

    }

    clearChat() {
        
    }

    exportChat() {

    }

    importChat() {

    }

    generateMessageID() {
        // Generate a random 12-digit ID (100000000000 to 999999999999)
        return Math.floor(Math.random() * 900000000000) + 100000000000;
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
            // Dispatch an Alert

        }))
    }

    dispatchChatExported() {
        this.dispatchEvent(new CustomEvent('chatExported', {
            // Dispatch an Alert

        }))
    }

    dispatchChatImported() {
        this.dispatchEvent(new CustomEvent('chatImported', {
            // Dispatch an Alert

        }))
    }
}

