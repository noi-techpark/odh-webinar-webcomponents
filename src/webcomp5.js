// API calls

const tmpl = document.createElement("template");
tmpl.innerHTML =`
    <style> 
        h1 {
            color: black; 
        } 
        .checkboxgroup {
            width: 20em;
            overflow: auto;
        }
        .checkboxgroup p {
            width: 12em;
            margin-bottom: 0.5em;
        }
        .checkboxgroup label {
            width: 12em;
            margin-left: 1em;
            float: left;
        }
        .checkboxgroup li {
            list-style: none;
        }
        .error {
            color: red;
        }
    </style>
    <h1 id="title"></h1>
    <p><slot /></p>
    <input type="text" id="input" /><button id="btn">OK</button>
    <span>&larr; <slot name="description">Default footer (replace me!)</slot></span>
    <div class="checkboxgroup">
        <p><span id="count">0</span> station types found</p>
        <ul id="list"></ul>
    </div>
    <p id="error"></p>
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

        // querySelector is good to use if you have a more complex query rule
        // otherwise getElementById is much faster...
        this._title = this.shadowRoot.querySelector("#title");
        this._input = this.shadowRoot.querySelector("#input");
        this._btn = this.shadowRoot.querySelector("#btn");
        this._error = this.shadowRoot.getElementById("error");
        this._list = this.shadowRoot.getElementById("list");
        this._count = this.shadowRoot.getElementById("count");
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
            this._title.innerHTML = this.title;
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
        console.log(`set title to ${newTitle}`);
        this.setAttribute("title", newTitle);
    }

    onSubmit() {
        this.title = this._input.value ? this._input.value : "All station types!";
        this.onApiCall(this._input.value);
    }

    onRadioChange(x) {
        console.log("fire: " + x.currentTarget.value);
    }

    listItem(name, value) {
        var li = document.createElement("li");
        var input = document.createElement("input");
        input.setAttribute("type", "radio");
        input.setAttribute("name", name);
        input.setAttribute("value", value);
        input.addEventListener('change', this.onRadioChange.bind(this) );
        li.appendChild(input);
        li.appendChild(document.createTextNode(value));
        return li;
    }

    listUpdate(data) {
        this._list.innerHTML = "";

        if (data) {
            data.forEach((element) => {
                this._list.appendChild(
                    this.listItem("stationtype", element.stype)
                );
            });
        }

        this._count.innerText = data ? data.length : 0;
    }

    onApiCall(stationTypes) {

        this._error.innerText = "";
        
        let where = "";
        if (stationTypes) {
            stationTypes = stationTypes.replace("*", "\\.*");
            where = `&where=stype.ire.${encodeURIComponent(stationTypes)}`;
        }

        const url = `https://mobility.api.opendatahub.bz.it/v2/flat/*?select=stype${where}`;
        fetch(url)
            .then((response) => {

                // Return a new promise such that we do not loose the json response,
                // which might contain useful information also during error reporting
                return new Promise((resolve, reject) => {
                    let func = response.status < 400 ? resolve : reject;
                    response.json().then(data => func({
                        status: response.status,
                        statusText: response.statusText,
                        data: data
                    }));
                });
            })

            // Success
            .then((response) => {
                console.debug(response)
                if (response.status >= 200 && response.status <= 299) {
                    this.listUpdate(response.data.data);
                }
            })

            // Error handling 
            // (usually only network errors would arrive here, without the first .then block)
            .catch((error) => {
                console.debug(error)
                this._error.innerText = error.data ? error.data.message : error;
                this.listUpdate(null);
            });
    }

    // Triggers when the element is added to the document *and*
    // becomes part of the page itself (not just a child of a detached DOM)
    connectedCallback() {
        this._btn.addEventListener('click', this.onSubmit.bind(this) );
    }

    //// NO render() method anymore
    // We do not reload the whole innerHTML anymore on each attribute or property change
    // Just the title text, which is needed
}

// Register our first Custom Element named <odh-table>
customElements.define('odh-table', OpenDataHubTable);