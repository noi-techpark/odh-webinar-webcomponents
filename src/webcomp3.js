
class OpenDataHubTable extends HTMLElement {
    constructor() {
        super();

        // We need an encapsulation of our component to not 
        // interfer with the host, nor be vulnerable to outside 
        // changes --> Solution = SHADOW DOM
        this.shadow = this.attachShadow(
            {mode: "open"}    // Set mode to "open", to have access to 
                              // the shadow dom from inside this component
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
            this.render();
            let btn = this.shadow.querySelector("#btn");
            btn.addEventListener('click', this.onTitleSubmit.bind(this) );
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
        this.setAttribute("title", newTitle)
    }

    onTitleSubmit() {
        let ctg = this.shadow.querySelector("#category");
        console.log(ctg.value)
        this.title = ctg.value;
    }

    // Triggers when the element is added to the document *and*
    // becomes part of the page itself (not just a child of a detached DOM)
    connectedCallback() {
        this.render();
        let btn = this.shadow.querySelector("#btn");
        btn.addEventListener('click', this.onTitleSubmit.bind(this) );
    }

    render() {
        this.shadow.innerHTML = `
            <style> 
                h1 {
                    color: black; 
                } 
            </style>
            <h1>
                ${this.title}
            </h1>
            <input type="text" id="category" /><button id="btn">OK</button>
        `;
    }
}

// Register our first Custom Element named <odh-table>
customElements.define('odh-table', OpenDataHubTable);