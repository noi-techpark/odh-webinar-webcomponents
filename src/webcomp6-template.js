// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const tmpl = document.createElement("template");
tmpl.innerHTML =`
    <style> 
        h1 {
            color: black; 
            font-size: 1.4em;
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
            width: 20em;
            margin-left: 1em;
            float: left;
        }
        .checkboxgroup li {
            list-style: none;
        }
        .error {
            color: red;
        }
        .value {
            text-align: right;
        }
        table {
            border-collapse: collapse;
            text-align: left;
            margin-top: 10px;
        }
        tr {
            line-height: 1.5;
            border: 1px solid gray;
        }
        td, th {
            font-family: monospace;
            padding: 8px;
            min-width: 100px;
        }
        .hide {
            display: none;
        }
    </style>
    <h1 id="title"></h1>
    <p><slot /></p>
    <input type="text" id="input" /><button id="btn">OK</button>
    <span>&larr; <slot name="description">Default footer (replace me!)</slot></span>
    <div id="container">
        <div class="checkboxgroup">
            <p><span id="count">0</span> items found</p>
            <ul id="list"></ul>
        </div>
        <table id="table" class="hide">
            <thead>
                <tr>
                    <th>Station</th>
                    <th>Time</th>
                    <th class="value">Value</th>
                </tr>
            </thead>
            <tbody id="tablebody">
            </tbody>
        </table>
    </div>
    <p id="error"></p>
`;

export default function() {
    return tmpl;
}