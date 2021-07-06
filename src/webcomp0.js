const tmpl_with_style = `
    <style> 
      h1 {
        color: black; 
      } 
    </style>
    <h1>Hello World!</h1>
`;

const tmpl = `
    <h1>Hello World!</h1>
`;



class OpenDataHubTable extends HTMLElement {
    constructor() {
        super();
        // Note: Never put rendering elements into the constructor
        //       That is too early, because attached attributes are not
        //       defined yet.
    }

    // Triggers when the element is added to the document *and*
    // becomes part of the page itself (not just a child of a detached DOM)
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = tmpl;
    }
}

// Register our first Custom Element named <odh-table>
customElements.define('odh-table', OpenDataHubTable);