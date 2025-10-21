import { SimpleChatModel } from "./model.js"
import { SimpleChatView } from "./view.js"
import { SimpleChatController } from "./controller.js"

function initializeApp() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Initialize Simple Chat...');

        const model = new SimpleChatModel();
        const view = new SimpleChatView();

        // Render the view in the #app container
        view.render('#app');

        // Link Everything through the Controller
        const controller = new SimpleChatController(model, view);
        controller.init();
    });
}

// Actually call the initialize function
initializeApp();