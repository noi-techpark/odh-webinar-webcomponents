// Templates & Slots...
// Advantage of single HTML parsing, that is, faster and less resources needed 
// inside the browser.

const tmpl = document.createElement("template");
tmpl.innerHTML =`
    <style> 
        h1 {
            color: black; 
        } 
    </style>
    <h1 id="title"></h1>
    <p><slot /></p>
    <input type="text" id="category" /><button id="btn">OK</button>
    <span>&larr; <slot name="description">Default footer (replace me!)</slot></span>
`;


class OpenDataHubTable extends HTMLElement {
    constructor() {
        super();

        // We need an encapsulation of our component to not 
        // interfer with the host, nor be vulnerable to outside 
        // changes --> Solution = SHADOW DOM
        this.attachShadow(
            {mode: "open"}    // Set mode to "open", to have access to 
                              // the shadow dom from inside this component
        );

        this.shadowRoot.appendChild(
            tmpl.content.cloneNode(true)
        );
    }

    // Attributes we care about getting values from
    // Static, because all OpenDataHubTable instances have the same
    //   observed attribute names
    static get observedAttributes() {
        return ['title'];
    }

    // Override from HTMLElement
    attributeChangedCallback(propName, oldValue, newValue) {
        console.log(`Changing "${propName}" from "${oldValue}" to "${newValue}"`);
        if (propName === "title") {
            let h1 = this.shadowRoot.querySelector("#title");
            if (h1) h1.innerHTML = this.title;
        }
    }

    // We should better use such getters and setters and not
    // internal variables for that to avoid the risk of an
    // endless loop and to have attributes in the html tag and
    // Javascript properties always in-sync.
    get title() {
        return this.getAttribute("title");
    }

    set title(newTitle) {
        console.log(`set title to ${newTitle}`)
        this.setAttribute("title", newTitle)
    }

    onTitleSubmit() {
        let ctg = this.shadowRoot.querySelector("#category");
        this.title = ctg.value;
    }

    // Triggers when the element is added to the document *and*
    // becomes part of the page itself (not just a child of a detached DOM)
    connectedCallback() {
        let btn = this.shadowRoot.querySelector("#btn");
        btn.addEventListener('click', this.onTitleSubmit.bind(this) );
    }

    //// NO render() method anymore
    // We do not reload the whole innerHTML anymore on each attribute or property change
    // Just the title text, which is needed
}

// Register our first Custom Element named <odh-table>
customElements.define('odh-table', OpenDataHubTable);