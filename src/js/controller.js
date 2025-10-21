export class SimpleChatController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        this.setupModelListeners();
        this.setupViewListeners();
    }

    // Model Event Listeners
    setupModelListeners() {
        this.model.addEventListener('messageAdded', (e) => {
            const message = e.detail.message;
            const isUser = message.isUser
            this.view.appendMessageToChat(message, message.isUser);
        });

        this.model.addEventListener('chatCleared', (e) => {
            this.view.clearChatMessages();
        });

        this.model.addEventListener('chatImported', (e) => {
            const importedMessages = e.detail.importedMessages;
            this.view.displayImportedMessages(importedMessages);
        });

        this.model.addEventListener('messageDeleted', (e) => {
            const messageId = e.detail.messageId;
            this.view.removeMessageFromChat(messageId);
        });
    }

    //  View Event Listeners
    setupViewListeners() {
        // Send Message
        this.view.addEventListener('sendMessage', (e) => {
            const detailObj = e.detail;
            this.model.addMessage(detailObj.message, detailObj.isUser);
        });

        // Clear Chat
        this.view.addEventListener('clearChat', (e) => {
            this.model.clearChat();
        });

        // Export Chat
        this.view.addEventListener('exportChat', (e) => {
            this.model.exportChat();
        });

        // Import Chat
        this.view.addEventListener('importChat', (e) => {
            const importedData = e.detail.importedData;
            this.model.importChat(importedData);
        });

        // Delete Message
        this.view.addEventListener('deleteMessage', (e) => {
            const messageId = e.detail.messageId;
            this.model.deleteMessage(messageId);
        });
    }
}

