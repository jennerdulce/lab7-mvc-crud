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
    }

    //  View Event Listeners
    setupViewListeners() {
        // Send Message
        this.view.addEventListener('sendMessage', (e) => {
            const detailObj = e.detail;
            this.model.addMessage(detailObj.message, detailObj.isUser);
        });
    }
}

