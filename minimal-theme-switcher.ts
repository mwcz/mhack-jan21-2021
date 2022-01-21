/*!
* Minimal theme switcher
*
    * Pico.css - https://picocss.com
    * Copyright 2020 - Licensed under MIT
*/

// Config
const buttonsTarget = "a[data-theme-switcher]";
const buttonAttribute = "data-theme-switcher";
const rootAttribute = "data-theme";

// Init
export function init() {
    document.querySelectorAll(buttonsTarget).forEach(
        function (button: HTMLButtonElement) {
            button.addEventListener(
                "click",
                function (event: Event) {
                    event.preventDefault();
                    document
                    .querySelector("html")
                    .setAttribute(
                        rootAttribute,
                        button.getAttribute(buttonAttribute)
                    );
                }.bind(this),
                false
            );
        }.bind(this)
    );
};
