import { loadData, fetchNames, saveData, flagInput, deleteCircuit } from "./saveFunctions.js";
import { loadCircuit } from "./loadFunctions.js";
import { screen } from "../logic/management.js";
import { loadProject } from "./loadProject.js";
//import { pasteCircuit } from "./paste.js";

const body = document.body;

function createSaveMenu() { 
    const saveMenu = document.createElement("div")
    body.appendChild(saveMenu)
    saveMenu.classList.add("saveMenu") 

    return saveMenu
}

/* Solved with CSS
function centerMenu(menu) {
    const bodyRect = body.getBoundingClientRect()
    const rect = menu.getBoundingClientRect()

    const left = (bodyRect.width - rect.width) / 2
    const top = (bodyRect.height - rect.height) / 2

    console.log(left, top)

    menu.style.left = left + "px"
    menu.style.top = top + "px"
}*/

const saveMenu = createSaveMenu()
styleMenu()
//centerMenu(saveMenu)

function styleMenu() {
    addCloseButton()
    addText()
    addSubMenu() 
    addSave()
}

function addCloseButton() {
    const closeButton = document.createElement("button")
    saveMenu.appendChild(closeButton)
    closeButton.classList.add("closeMenu")
}

function addText() {
    const text = document.createElement("p")
    saveMenu.appendChild(text)

    text.innerHTML = `This menu stores all your saved Electrical Circuits. You can remove any one of them by clicking them, or add more by clicking the save button.`
}

function addSubMenu(boolean = false, otherElement = null, isProjectMenu = false) {
    console.log(isProjectMenu, "s")
    const subMenu = document.createElement("div") 
    if (boolean) {
        saveMenu.insertBefore(subMenu, otherElement)
    } else {
        saveMenu.appendChild(subMenu)
    }
    
    subMenu.classList.add("subSaveMenu")

    const text = document.createElement("p")
    text.innerHTML = `<b><u>Saved ${isProjectMenu ? "Projects" : "Circuits"}:</b></u>`
    subMenu.appendChild(text)

    text.style.width = "80%"
    text.style.margin = "0 auto"
    text.style.textAlign = "center"

    const scrollDiv = document.createElement("div")
    subMenu.appendChild(scrollDiv)
    scrollDiv.classList.add("scrollArea")

    const names = fetchNames(isProjectMenu)

    if (names.length > 0) {
        names.forEach(name => {
            const data = loadData(name, isProjectMenu)

            const slot = document.createElement("div")
            scrollDiv.appendChild(slot)
            slot.classList.add("slot")
            
            
            let t = `<b><u>${isProjectMenu ? "Project" : "Electrical Circuit"} Name:</u></b> <br> ${name} <br> `

            if (data.description) {
                t += `<b><u>Description:</u></b> <br> ${data.description}`
            }

            const p = document.createElement("p")
            p.innerHTML = t
            slot.appendChild(p)

            const deleteButton = document.createElement("button")
            deleteButton.classList.add("delete")
            slot.appendChild(deleteButton)

            const deleteFunc = () => {
                deleteCircuit(name, deleteButton)
            }

            deleteButton.addEventListener("click", deleteFunc)

            const load = document.createElement("button")
            slot.appendChild(load)
            load.innerHTML = "LOAD"

            if (!isProjectMenu) {
                const copy = document.createElement("button")
                slot.appendChild(copy)
                copy.innerHTML = "COPY"
            } else {
                load.classList.add("projectButton");
            }
        })
    } else {
        const alertP = document.createElement("p")
        alertP.innerHTML = `<b>NO ${isProjectMenu ? "PROJECTS" : "CIRCUITS"} HAVE BEEN SAVED</b>`
        scrollDiv.appendChild(alertP)
        alertP.classList.add("alertP")
    }
}

function addSave() {
    const subMenu = document.createElement("div")
    subMenu.classList.add("subSaveMenu")
    saveMenu.appendChild(subMenu)

    subMenu.style.left = "100%"
    subMenu.style.transform = "translate(-100%, -100%)"

    const text = document.createElement("p")
    text.innerHTML = "<b><u>Save This Circuit:</b></u>"
    subMenu.appendChild(text)

    text.style.textAlign = "center"

    const nameP = document.createElement("p")
    nameP.innerHTML = "<b><u>Name:</b></u>"
    nameP.style.margin = "0"
    nameP.style.marginLeft = "10%"
    subMenu.appendChild(nameP)

    const nameInput = document.createElement("input")
    subMenu.appendChild(nameInput)

    nameInput.type = "text"
    nameInput.placeholder = `Type in the name of the Circuit`;

    const descriptionP = document.createElement("p")
    descriptionP.innerHTML = "<b><u>Description:</b></u>"
    descriptionP.style.margin = "0"
    descriptionP.style.marginLeft = "10%"
    subMenu.appendChild(descriptionP)
    
    const descriptionInput = document.createElement("textArea")
    subMenu.appendChild(descriptionInput)
    descriptionInput.style.flex = "1"
    descriptionInput.placeholder = `Describe this Circuit so you can better differentiate it from the rest`
    
    const save = document.createElement("button")
    subMenu.appendChild(save)
    save.classList.add("saveButton")
    save.innerHTML = "SAVE"
}

saveMenu.addEventListener("click", (event) => {
    const target = event.target

    if (target.classList.contains("saveButton")) {
        const nameInput = document.querySelector("input")
        const descriptionInput = document.querySelector("textarea")

        if (nameInput.value) {
            if (nameInput.value.length <= 25) {
                const isProjectMenu = sessionStorage.getItem("lastMenu") === "project";
                saveData(nameInput.value, descriptionInput.value, false,isProjectMenu)

                //Removes all the added element IDs
                if (sessionStorage.getItem("lastMenu") === "project") { //all screens
                    Array.from(document.querySelectorAll(".screen")).forEach(screenToFix => {
                        for (const element of screenToFix.querySelectorAll(".userCreated,.wire")) {
                            element.removeAttribute("id");
                        }
                    })
                } else { //just the visible screen
                    for (const element of screen.querySelectorAll(".userCreated,.wire")) {
                        element.removeAttribute("id");
                    }
                }

                //Forces the submenu to update
                //Quite inefficient as it rerenders the whole submenu instead of just updating the specific entry
                reRenderSubMenu(isProjectMenu);
            } else {
                nameInput.value = "Names must be no more than 25 characters"

                flagInput(nameInput)
            }
        } else {
            flagInput(nameInput)
        }
    } else if (target.classList.contains("closeMenu")) {
        adjustMenu()
    } else if (Array.from(document.querySelectorAll(".slot button")).includes(target)) {
        const name = determineName(target)

        const buttonType = target.innerHTML //Either LOAD or COPY
        const isProjectMenu = sessionStorage.getItem("lastMenu") === "project";

        if (buttonType === "LOAD") { //LOAD
            if (isProjectMenu) {
                loadProject(name);
            } else {
                loadCircuit(name);
            }
            console.log("LOAD", name)
        } else if (buttonType === "COPY") { //COPY
            console.log("COPY", name)
            
            if (isProjectMenu) {

            } else {
                //Here we only need to store the associated data in the session storage so that
                //the paste functions will work later on, there is also a visual cue given
                sessionStorage.setItem("allElementsId", localStorage.getItem(`${name}-allElementsId`));
                sessionStorage.setItem("allObjectId", localStorage.getItem(`${name}-allObjectId`));
                sessionStorage.setItem("wiresId", localStorage.getItem(`${name}-wiresId`));
                sessionStorage.setItem("circuitHTML", localStorage.getItem(`${name}-circuitHTML`));
            }
        }
    }
})

export function adjustMenu(isProjectMenu = false) {
    if (saveMenu.classList.contains("visible")) {
        saveMenu.classList.remove("visible")
    } else {
        const lastMenu = sessionStorage.getItem("lastMenu");
        sessionStorage.setItem("lastMenu", isProjectMenu ? "project" : "circuit");
        
        saveMenu.querySelector("p").innerHTML = `This menu stores all your saved 
        ${isProjectMenu ? "Projects" : "Electrical Circuits"}. You can remove any one of them by clicking them, or add more by clicking 
        the save button.`

        const subs = saveMenu.querySelectorAll(".subSaveMenu");
        subs[0].querySelector("p").innerHTML = `Saved ${isProjectMenu ? "Projects" : "Circuits"}`;
        subs[1].querySelector("p").innerHTML = `Save This ${isProjectMenu ? "Project" : "Circuit"}`;
        subs[1].querySelector("input").placeholder = `Type in the name of this ${isProjectMenu ? "Project" : "Circuit"}`;
        subs[1].querySelector("textarea").placeholder = `Describe this ${isProjectMenu ? "Project" : "Circuit"} so you can better differentiate it from the rest`;

        if (lastMenu && ((lastMenu === "project" && !isProjectMenu) || (lastMenu === "circuit" && isProjectMenu))) {
            reRenderSubMenu(isProjectMenu);
            console.log(lastMenu, isProjectMenu)
        } else {
            const parsed = JSON.parse(localStorage.getItem(isProjectMenu ? "projects" : "names"));
            const usableNames = parsed ? parsed : [];

            const entries = document.querySelectorAll(".slot")

            if (entries.length <= usableNames.length || (!lastMenu && isProjectMenu)) { //a new entry was added
                reRenderSubMenu(isProjectMenu) //this is an inefficient way of reusing the same menu for both projects and circuits
            } 
        }

        const input = document.querySelector("input")
        const textArea = document.querySelector("textarea")

        input.value = ""
        textArea.value = ""

        saveMenu.classList.add("visible")
    }
}

function determineName(target) {
    //Determines which button was pressed
    const parent = target.parentElement

    const name = parent.querySelector("p").innerHTML.split(" <br> ")[1]

    return name
}

export function reRenderSubMenu(isProjectMenu) {
    const subMenu = Array.from(document.querySelectorAll(".subSaveMenu")).filter(element => {
        const children = Array.from(element.querySelectorAll("*"))

        return children.some(child => child.classList.contains("scrollArea"))
    })[0]

    const otherMenu = Array.from(document.querySelectorAll(".subSaveMenu")).filter(el => el !== subMenu)[0]

    subMenu.remove()

    addSubMenu(true, otherMenu, isProjectMenu)
}