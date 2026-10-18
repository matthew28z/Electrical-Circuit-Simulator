import * as d3 from "d3";

import { transform as tObject} from "../camera/move.js";
import { allObject, allG, screen } from "../logic/management.js";
import { allElements } from "../logic/paths";
import { wires } from "../logic/wires.js";
import { screensObject } from "./toggleScreens.js";
import { saveProject } from "./saveProject.js";

const saveMenu = document.querySelector(".saveMenu");

//localStorage.setItem("names", JSON.stringify(JSON.parse(localStorage.getItem("names")).pop()))

function formatName(name, isProjectMenu = false) {
    if (isProjectMenu)
        return name + "-P";

    return name;
}

export function fetchNames(isProjectMenu = false) {
    const dataNames = localStorage.getItem(isProjectMenu ? "projects" : "names") 

    if (dataNames) {
        const usableNames = JSON.parse(dataNames)

        return usableNames
    }

    return []
}

export function loadData(name, isProjectMenu = false) { //fetches the stored circuit-data regarding a specific key
    //Needs a check when creating a project or a circuit
    const storedData = localStorage.getItem(formatName(name, isProjectMenu)) //project names have this tag to avoid collisions

    if (storedData) {
        const usableData = JSON.parse(storedData)

        return usableData
    } 
    
    console.log("THERE WAS AN ERROR IN LOADING YOUR DATA")

    return null
}

//Logic for quick save
const quickSave = (event) => {
    if (event.key.toLowerCase() === "s") {
        const name = sessionStorage.getItem("quickSave"); //represents the last saved circuit

        if (name) { //Checks if there has been a previous save
            saveData(name, loadData(name).description, true)
        }
    }
}

window.addEventListener("keydown", quickSave)

const lastParams = { name: null, description: null };

const keywords = new Set(["names", "allElementsId", "allObjectId", "wiresId", "quickSave",
                          "circuitHTML", "projects", "projectData"]);

export function saveData(name, description, boolean = false, isProjectMenu = false) {
    if (lastParams.name === name) {
        boolean = true
        description = lastParams.description

        //resets
        lastParams.name = null
        lastParams.description = null
    } else {
        //updates
        lastParams.name = name
        lastParams.description = description
    }
    const parsed = isProjectMenu ? JSON.parse(localStorage.getItem("projects")) : JSON.parse(localStorage.getItem("names"));
    const names = parsed ? parsed : [];

    const confirmFunc = (e) => {
        if (e.key === "Enter") {
            saveData(name, description, true, isProjectMenu)
        } else {
            window.removeEventListener("keydown", confirmFunc)
        }
    }

    const textArea = document.querySelector("textarea");
    const input = document.querySelector("input");

    if (keywords.has(name) || name.endsWith("-P") && !isProjectMenu) { //doesnt allow circuits to be saved with -P at the end
        textArea.value = `"${name}" is not a valid name, please type in another name for the circuit`
        flagInput(textArea)
    } else if (names.includes(name) && !boolean) { //boolean will be true only after the confirmation click
        textArea.value = "";

        textArea.placeholder = `You already have a circuit saved under the same name, if you want to replace
                          it, either click the "SAVE" button again or press "Enter"`
        
        flagInput(textArea)                  
        window.addEventListener("keydown", confirmFunc)                  
    } else { //save the data
        if (isProjectMenu) {
            saveProject(name);

            input.placeholder = "Project Data Saved";
        } else {
            const preparedData = prepareData() 

            allG.node().dataset.zoomObject = JSON.stringify(tObject);

            localStorage.setItem(`${name}-wiresId`, JSON.stringify(prepareWires()))
            localStorage.setItem(`${name}-allElementsId`, JSON.stringify(preparedData.allElementsId))
            localStorage.setItem(`${name}-allObjectId`, JSON.stringify(preparedData.allObjectId))
            localStorage.setItem(`${name}-circuitHTML`, screen.innerHTML)

            window.removeEventListener("keydown", confirmFunc)

            input.placeholder = "Circuit Data Saved";

            //Adds quick save compatability 
            sessionStorage.setItem("quickSave", name)
        }

        localStorage.setItem(formatName(name, isProjectMenu), JSON.stringify({ name: name, description: description }));
        updateNames(name, isProjectMenu);
        input.value = "";
        textArea.value = "";

        textArea.placeholder = "Close this menu and reopen it for the data to refresh";
        
        flagInput(textArea, true)
        flagInput(input, true)
    }
}

function updateNames(newEntry, isProjectMenu = false) {
    const key = isProjectMenu ? "projects" : "names";
    const savedData = localStorage.getItem(key);

    const usableData = savedData ? JSON.parse(savedData) : [];

    if (!usableData.includes(newEntry)) {
        usableData.push(newEntry);

        localStorage.setItem(key, JSON.stringify(usableData));
    }
}

export function prepareData(screenToPrepare = screen) {
    const screenIndex = screenToPrepare.id.at(-1);
    const elementData = screenToPrepare.innerHTML

    const screenData = screensObject[`screen_${screenIndex}`];

    const keys = Object.keys(screenData.allObject)

    const allObjectId = {}

    keys.forEach(key => {
        const array = screenData.allObject[key]

        const elementClass = key.slice(0, -1) //returns everything except the last character

        //Passes IDs to all the elements (except wires) and stores the data in a way that JSON.stringify will work
        //Processes the allObject object
        let change = 0
        const arrayId = array.map((object, index) => {
            let id = `${elementClass}-${screenIndex}-${index + change}`

            while (document.getElementById(id)) {
                change++
                id = `${elementClass}-${screenIndex}-${index + change}`
            }

            object.element.id = id

            const {element, ...rest} = object

            return {id: id, ...rest}
        })

        allObjectId[key] = arrayId
    })

    //Processes the allElements array
    const allElementsId = Array.from(screenData.allElements.values()).map(object => {
        const objectId = {id: null, connections: { left: [], right: [] }}

        const id = object.element.id
        objectId.id = id

        objectId.connections.left = Array.from(object.connections.left).map(element => element.id);
        objectId.connections.right = Array.from(object.connections.right).map(element => element.id);

        return objectId
    })

    return {allElementsId: allElementsId, allObjectId: allObjectId}
}

export function prepareWires(screenToPrepare = screen) {
    const screenIndex = screenToPrepare.id.at(-1);

    //Filters to the wires currently visible as wires stores more than that
    const visibleWires = wires.filter(object => object.element.closest(`#${screenToPrepare.id}`));

    //Passes IDs to all the filtered wires, assumes all other elements have already been processed (i.e. given an ID)
    let tracker = 0;
    visibleWires.forEach(object => {
        console.log(object.element)
        object.element.id = `wire-${screenIndex}-${tracker}`;
        console.log(object.element.id)
        tracker++;
    })

    //Creates an array that can be stored
    return visibleWires.map(object => {
        const {element, connections, ...rest} = object

        console.log(connections.map(el => el.id))
        return {id: element.id, connections: connections.map(el => el.id), ...rest}
    })
}

export function flagInput(element, goodFlag = false) {
    element.style.borderColor = goodFlag ? "lightGreen" : "red"

    const timeMs = goodFlag ? 3000 : 2000

    setTimeout(() => {
        element.style.borderColor = "gold" 
    }, timeMs);
}

export function saveCircuitTemporary(name) {
    const preparedData = prepareData()

    sessionStorage.setItem(`${name}-allElementsId`, preparedData.allElementsId)
    sessionStorage.setItem(`${name}-allObjectId`, preparedData.allObjectId)
}

let lastSlot = null

export function deleteCircuit(name, button, boolean = false) {
    const slot = button.parentElement

    if (lastSlot === slot) {
        boolean = true

        lastSlot = null
    }

    const input = document.querySelector("input")
    const textArea = document.querySelector("textarea")

    const confirmFunc = (e) => {
        if (e.key === "Enter") {
            deleteCircuit(name, button, true)
        } else {
            window.removeEventListener("keydown", confirmFunc)

            input.value = "Deletion Canceled."
            textArea.value = ""

            flagInput(input)
            flagInput(textArea)
        }
    }

    if (!boolean) {
        input.value = "Are you sure?"
        textArea.value = `This action will be permanent, press "Enter" or click the "X" button again to confirm. To cancel press any other key.`

        flagInput(input)
        flagInput(textArea)

        lastSlot = slot

        window.addEventListener("keydown", confirmFunc)
    } else {
        input.value = `Succesful deletion.`

        flagInput(input, true)

        textArea.value = `Circuit "${name}" deleted.`

        flagInput(textArea, true)

        window.removeEventListener("keydown", confirmFunc)

        localStorage.removeItem(name)
        localStorage.removeItem(name + "-allElementsId")
        localStorage.removeItem(name + "-allObjectId")
        localStorage.removeItem(name + "-circuitHTML")
        localStorage.removeItem(name + "wires")

        slot.remove()

        //Updates names
        const storedData = localStorage.getItem("names")

        let usableData = JSON.parse(storedData)

        //updates the data
        usableData = usableData.filter(val => val !== name)

        localStorage.setItem("names", JSON.stringify(usableData))

        //Checks whether the deleted circuit was the last one to be saved
        if (sessionStorage.getItem("quickSave") === name) {
            sessionStorage.removeItem("quickSave")
        }
    }
}
