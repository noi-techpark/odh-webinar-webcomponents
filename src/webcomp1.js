/*
 * Shadow DOM
 */

const tmpl = `
    <style> 
      h1 {
        color: black; 
      } 
    </style>
    <h1>Hello World!</h1>
`;


class OpenDataHubTable extends HTMLElement {
    constructor() {
        super();

        // We need an encapsulation of our component to not 
        // interfer with the host, nor be vulnerable to outside 
        // changes --> Solution = SHADOW DOM
        this.shadow = this.attachShadow(
            {mode: "open"}    // Set mode to "open", to have access to the shadow dom from inside this component
        );
    }

    // Triggers when the element is added to the document *and*
    // becomes part of the page itself (not just a child of a detached DOM)
    connectedCallback() {
        this.render();
    }

    render() {
        this.shadow.innerHTML = tmpl;
    }
}

// Register our first Custom Element named <odh-table>
customElements.define('odh-table', OpenDataHubTable);