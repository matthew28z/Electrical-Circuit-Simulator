import * as d3 from "d3";

import { addEventListeners, removeEventListeners, changeOperation } from "../logic/elementFunctions.js";
import { changeValues, allObject } from "../logic/management.js";
import { changeAllElements, allElements } from "../logic/paths";
import { wires, removeFakeWires } from "../logic/wires.js";
import { changeTransform, transform } from "../camera/move.js";
import { removeZoom, addZoom } from "../camera/zoom.js";

const dynamicMenuButtons = new Set(["camera"]); //a set is used to allow for expandability
const dynamicMenuFunctions = new Map([
    ["camera", { clear: removeZoom, set: addZoom }]
]);

const screensButtons = Array.from(document.querySelectorAll(".screensDiv button"));
const screensObject = {
    screen_0: { allObject, allElements, transform } //accounts for mutations but not for reassignments just like its intention
}
const body = document.body;

let numberOfScreens = -1;

export function addScreen(change = false, isFirstScreen = false) {
    const screensDiv = document.querySelector(".screensDiv")
    const addScreenButton = document.querySelector(".addScreen")

    const screenButton = document.createElement("button")
    screensDiv.insertBefore(screenButton, addScreenButton)

    const clickFunc = () => {
        addClickLogic(screenButton)
    }

    screenButton.addEventListener("click", clickFunc)

    numberOfScreens++

    screenButton.innerHTML = `Screen-${numberOfScreens + 1}`
    screenButton.id = `ScreenButton-${numberOfScreens}`

    if (!isFirstScreen) {
        //creates the new screen and all the supportive elements
        const newScreen = document.createElement("div")
        newScreen.classList.add("screen")
        newScreen.id = "screen-" + numberOfScreens
        body.appendChild(newScreen)

        const newOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        newScreen.appendChild(newOverlay)
        newOverlay.classList.add("overlay")

        const newSVG = d3.select(newOverlay)

        const newAllG = newSVG.append("g")
        newAllG.classed("allG", true)

        const newBridgeG = newAllG.append("g")
        newBridgeG.classed("bridgeG", true)

        const newCBridgeG = newAllG.append("g")
        newCBridgeG.classed("cBridgeG", true)

        const newWireG = newAllG.append("g")
        newWireG.classed("wireG", true)
    
        const newCurrentG = newAllG.append("g")
        newCurrentG.classed("currentG", true)

        const newFakeWireG = newAllG.append("g")
        newFakeWireG.classed("fakeWireG", true)

        const newMarkerG = newAllG.append("g");
        newMarkerG.classed("markerG", true);

        //Repositions the supportive groups
        newWireG.lower()
        newFakeWireG.raise()
        newCurrentG.raise()
        newBridgeG.raise()
        newCBridgeG.raise()
        newMarkerG.raise();
        newAllG.lower()

        const newTransform = {x: 0, y: 0, z: 1}

        //updates the screensObject
        const newAllElements = new Map();
        const newAllObject = {    
            voltageSources: [],
            resistors: [],
            connections: [],
            amperometers: []
        }

        screensObject[`screen_${numberOfScreens}`] = {allObject: newAllObject, allElements: newAllElements, transform: newTransform}

        if (change) {
            addClickLogic(screenButton)
        }
    } else {
        screenButton.classList.add("currentScreenButton")

        //Adds event listeners (special case as no old screen exists)
        const screen = document.querySelector(".visible.screen");

        changeOperation(screen);
        addEventListeners(screen);
    }
    
    screensButtons.push(screenButton)
}

export function addClickLogic(button) {
    const lastScreenButton = document.querySelector(".currentScreenButton")

    lastScreenButton.classList.remove("currentScreenButton")

    button.classList.add("currentScreenButton")

    const screenNumber = Number(button.id.split("-")[1])

    changeScreen(screenNumber)
}

/*
function filterWires(screenNumber) {
    
}*/

function changeScreen(screenNumber) {
    if (screenNumber === -1) { //creates a new screen
        addScreen(true)

        return;
    } 

    let dynamicButton;

    const currentMenuButton = document.querySelector(".enabled");

    if (currentMenuButton &&dynamicMenuButtons.has(currentMenuButton.id)) {
        dynamicButton = currentMenuButton.id;

        //clear the old screen
        dynamicMenuFunctions.get(dynamicButton)?.clear();
    }

    const oldScreen = body.querySelector(".visible.screen")
    oldScreen.classList.remove("visible")
    //Call this before reassigning operation
    removeEventListeners(oldScreen);

    const newScreen = document.getElementById(`screen-${screenNumber}`)

    changeOperation(newScreen)
    addEventListeners(newScreen)

    newScreen.classList.add("visible")

    changeValues(newScreen, d3.select(`#screen-${screenNumber} .overlay`), d3.select(`#screen-${screenNumber} .bridgeG`), d3.select(`#screen-${screenNumber} .cBridgeG`), d3.select(`#screen-${screenNumber} .currentG`), d3.select(`#screen-${screenNumber} .fakeWireG`), d3.select(`#screen-${screenNumber} .wireG`), d3.select(`#screen-${screenNumber} .markerG`), d3.select(`#screen-${screenNumber} .allG`), screensObject[`screen_${screenNumber}`].allObject)
    changeTransform(screensObject[`screen_${screenNumber}`].transform)
    changeAllElements(screensObject[`screen_${screenNumber}`].allElements)

    removeFakeWires()

    if (dynamicButton) {
        //Set the function to the correct screen
        dynamicMenuFunctions.get(dynamicButton)?.set();
    }
}

//Under Development
function loadCircuit(name) {
    const entry = localStorage.getItem(name)

    if (entry) {
        const allElementsId = JSON.parse(localStorage.getItem(name + "-allElementsId"))
        const allObjectId = JSON.parse(localStorage.getItem(name + "-allObjectId"))
        const circuitHTML = JSON.parse(localStorage.getItem(name + "-circuitHTML"))

        changeScreen(-1)
    }
}

//Under Development
function copyCircuit(name) {
    const savedData = localStorage.getItem(name)

    if (savedData) {
        const usableData = JSON.parse(savedData)


    }
}