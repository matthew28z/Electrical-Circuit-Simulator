import { addVoltage, removeVoltage, voltageSources } from "./voltage.js";
import { removeElement as remove, removeDelete as remove2 } from "./delete.js";
import { addResistor, removeResistor } from "./resistor.js";
import { addWire, removeWire } from "./wires.js";
import { addConnection, removeConnection } from "./connection.js";
import { findAllPaths } from "./paths.js";
import { drawCurrent } from "./current.js";
import { addMove, removeMove } from "../camera/move.js";
import { calculateResistance } from "../calculation/calculateResistance.js";

//function names
const funcNames = [addVoltage, addWire, addResistor, addConnection, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addVoltage, addMove, null, remove];
const handles = [removeVoltage, removeWire, removeResistor, removeConnection, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeVoltage, removeMove, null, remove2];

//icon names
const iconNames1 = ["voltageSource", "wire", "resistor", "connection", "amperometer", "placeholder3", "placeholder4", "placeholder5", "placeholder6", "placeholder7", "placeholder8", "placeholder9"];
const iconNames2 = ["voltage1", "wire1", "voltage2", "placeholder11", "placeholder12", "placeholder31", "placeholder14", "placeholder15", "placeholder16", "camera", "currentFlow", "delete"];

const root = document.documentElement;
const body = document.body;
const screen = document.getElementById("screen");

//creates the menu
const menu = document.createElement("div");
body.appendChild(menu);
menu.classList.add("menu");

//creates the top part of the menu
const topPart = document.createElement("div");
menu.appendChild(topPart);
topPart.classList.add("topPart");

const showMenu = document.createElement("button");
topPart.appendChild(showMenu);
showMenu.innerHTML = "⬇️"
showMenu.classList.add("showMenu");

const topText = document.createElement("p");
topPart.appendChild(topText);
topText.innerHTML = "Start Creating Your Own Electrical Circuit";
topText.style.marginLeft = (topPart.clientWidth - topText.clientWidth) / 2 - showMenu.clientWidth + "px"

//creates the menu options
const numberOfSubmenus = 2;
const numberOfButtons = 12;

const subMenus = [];
const buttons = [];
//seperates the options 
for (let i = 0; i < numberOfSubmenus; i++) {
    const div = document.createElement("div")
    menu.appendChild(div)
    div.classList.add("subMenu")
    div.style.height = (menu.clientHeight - topPart.clientHeight) / numberOfSubmenus + "px"

    subMenus.push(div)
    //creates the different options
    for (let x = 0; x < numberOfButtons; x++) {
        const button = document.createElement("button")
        div.appendChild(button)
        //button.style.width = button.clientHeight + "px"
        //button.style.marginLeft = (div.clientWidth - 4 - numberOfButtons * button.clientWidth) / (numberOfButtons - 1) + "px"
        if (x === 0) {
            button.style.marginLeft = "2px"
        } else if (x === numberOfButtons - 1) {
            button.style.marginRight = "2px"
        }

        if (i === 0) {
            button.style.backgroundImage = `url("../icons/${iconNames1[x]}Text.svg")`
            button.id = iconNames1[x] 
            console.log(button.id)
        } else {
            button.style.backgroundImage = `url("../icons/${iconNames2[x]}Text.svg")`
            button.id = iconNames2[x]
        }

        buttons.push(button)
    }
}


//adds click logic for all buttons
showMenu.addEventListener("click", function () {
    //this.style.transform = "rotate(180deg)"
    if (this.innerHTML === "⬆️") {
        this.innerHTML = "⬇️"
        menu.style.height = "30%"

        topText.innerHTML = "Start Creating Your Own Electrical Circuit"

        subMenus.forEach(subMenu => {
            subMenu.style.display = "inline-flex"
        });
    } else {
        this.innerHTML = "⬆️"
        menu.style.height = this.parentElement.clientHeight + 2 + "px"

        topText.innerHTML = "Click The Arrow To Open The Menu"

        subMenus.forEach(subMenu => {
            subMenu.style.display = "none"
        });
    }
})

//Last button tracker
let lastButton;

for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].id === "currentFlow") { //this specific button has different logic
        continue
    }

    buttons[i].addEventListener("click", function () {
        const styles = window.getComputedStyle(buttons[i])

        if (styles.borderColor === "rgb(0, 0, 0)") {
            if (lastButton) {
                const index = buttons.findIndex(button => button === lastButton)
                
                lastButton.style.borderColor = "black"
                handles[index]() //removes the event listener
            }

           this.style.borderColor = "white" //highlights the clicked button
           lastButton = this //stores the latest clicked button
           funcNames[i]() //adds the event listener corresponding to that button
        } else {
            this.style.borderColor = "black" //resets the button
            handles[i]()
            
            lastButton = null
        }
    })
}

const currentFlow = document.getElementById("currentFlow");
currentFlow.style.borderColor = "gold"

currentFlow.addEventListener("click", () => {
    const isConventional = Number(getComputedStyle(root).getPropertyValue("--current-flow")) === -20

    if (isConventional) {
        currentFlow.style.borderColor = "silver"
        root.style.setProperty("--current-flow", 20)
    } else {
        currentFlow.style.borderColor = "gold"
        root.style.setProperty("--current-flow", -20)        
    }
})

window.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    const path = findAllPaths(voltageSources)

    drawCurrent(path)

    console.log(calculateResistance(path))
  }
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault()
})