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
        
    }

    exportChat() {

    }

    importChat() {

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

