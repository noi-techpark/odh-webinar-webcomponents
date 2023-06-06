// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Import, modules and full web component

import apicall from './webcomp6-api.js';
import template from './webcomp6-template.js';

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
            template().content.cloneNode(true)
        );

        // querySelector is good to use if you have a more complex query rule
        // otherwise getElementById is much faster...
        this._title = this.shadowRoot.querySelector("#title");
        this._input = this.shadowRoot.querySelector("#input");
        this._btn = this.shadowRoot.querySelector("#btn");
        this._error = this.shadowRoot.getElementById("error");
        this._list = this.shadowRoot.getElementById("list");
        this._count = this.shadowRoot.getElementById("count");
        this._datatypes = this.shadowRoot.getElementById("datatypes");
        this._container = this.shadowRoot.getElementById("container");
        this._table = this.shadowRoot.getElementById("table");
        this._tablebody = this.shadowRoot.getElementById("tablebody");

        this.stationType = "*";
        this.dataType = "*";
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

    get inputValue() {
        return this._input.value ? this._input.value : "All station types!";
    }

    onSubmit() {
        this.title = this.inputValue;
        this._table.classList.add("hide");
        this.apicallStationTypes(this._input.value);
    }

    onRadioChange(x) {

        switch (x.currentTarget.name) {
            case "stationtype":
                this.title = `${this.inputValue} &rarr; ${x.currentTarget.value}`;
                this.stationType = x.currentTarget.value
                this.apicallDataTypes(x.currentTarget.value);
                break;
            case "datatype":
                this.title = `${this.inputValue} &rarr; ${this.stationType} &rarr; ${x.currentTarget.value}`;
                this.dataType = x.currentTarget.value;
                this.apicallMeasurements(this.stationType, this.dataType);
                break;
        }
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

    listUpdate(data, name, field) {
        this._list.innerHTML = "";

        if (data) {
            data.forEach((element) => {
                this._list.appendChild(
                    this.listItem(name, element[field])
                );
            });
        }

        this._count.innerText = data ? data.length : 0;
    }

    apicallStationTypes(stationTypes) {

        this._error.innerText = "";

        let where = "";
        if (stationTypes) {
            stationTypes = stationTypes.replace("*", "\\.*");
            where = `&where=stype.ire.${encodeURIComponent(stationTypes)}`;
        }

        apicall(
            `*/*/latest?select=stype${where}`, 
            response => {
                this.listUpdate(response.data.data, "stationtype", "stype");
            },
            error => {
                this._error.innerText = error.data ? error.data.message : error;
                this.listUpdate(null);
            }
        );
    }

    apicallDataTypes(stationType) {

        this._error.innerText = "";

        apicall(
            `${stationType}/*/latest?select=tname`, 
            response => {
                this.listUpdate(response.data.data, "datatype", "tname");
            },
            error => {
                this._error.innerText = error.data ? error.data.message : error;
                this.listUpdate(null);
            }
        );
    }

    createTable(data) {
        this._tablebody.innerHTML = "";
        data.forEach(el => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${el.sname}</td>
                <td>${el.mvalidtime}</td>
                <td class="value">${el.mvalue}</td>`;
            this._tablebody.appendChild(tr);
        });
        this._table.classList.remove("hide");
        this._count.innerText = data ? data.length : 0;
    }

    apicallMeasurements(stationType, dataType) {

        console.log(stationType, dataType);

        this._error.innerText = "";
        this.listUpdate(null);

        apicall(
            `${stationType}/${dataType}/latest?select=mvalue,mvalidtime,sname`, 
            response => {
                this.createTable(response.data.data);
            },
            error => {
                this._error.innerText = error.data ? error.data.message : error;
            }
        );
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