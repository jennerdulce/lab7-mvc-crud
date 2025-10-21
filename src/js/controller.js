class SimpleChatController extends HTMLElement{
    constructor(model, view) {
        super();
        this.model = model;
        this.view = view;
    }

    connectedCallback() {
        this.setupModelListeners();
        this.setupViewListeners();
    }

    setupModelListeners() {

    }

    setupViewListeners() {

    }
}