import * as d3 from "d3";

import { wireG, bridgeG, cBridgeG, currentG, fakeWireG, allG, allObject } from "../logic/management.js"
import { transform } from "../camera/move.js";
import { processAllElementsId, processAllObjectId, processWiresId } from "./commonFunctions.js";
import { adjustWireCounter, wireCounter, wires, clickedElements } from "../logic/wires.js";
import { allElements } from "../logic/paths.js";
import { deleteElementFromAllElements } from "./delete.js";


const quickPaste = (event) => {
    if (event.key.toLowerCase() === "p") {
        //Begin the process
    }
}

window.addEventListener("keydown", quickPaste)

function copyCircuit(name) {
    //Stores the saved circuit's data to quickly access them later on
    sessionStorage.setItem(`allElementsId`, localStorage.getItem(`${name}-allElementsId`))
    sessionStorage.setItem(`allObjectId`, localStorage.getItem(`${name}-allObjectId`))
    sessionStorage.setItem(`wiresId`, localStorage.getItem(`${name}-wiresId`))
    sessionStorage.setItem(`circuitHTML`, localStorage.getItem(`${name}-circuitHTML`))
}

function pasteHTML(circuitHTML) {
    const addedElements = [];
    //Converts the raw text data into an HTML that can be processed easily
    const parser = new DOMParser();
    const circuit = parser.parseFromString(circuitHTML, "text/html"); //This represents the circuit as HTML
   
    const circuitAllG = circuit.querySelector(".allG");
    const oldTransform = d3.zoomTransform(circuitAllG);

    /*Some math I didn't get my head into that much, used AI and d3 to understand them
      Basically the goal is to change the coords of each element to something that 
      will fit perfectly in the new allG. I did not try to find a solution for how the zoom would 
      accounted for as that is not really the focus of the project, and I have already resorted to D3 in the past*/
    const newTransform = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.z);
    //old coords -> world coords -> relative coords
    const newZoom = newTransform.k / oldTransform.k;
    const relativeTransform = d3.zoomIdentity.translate(newTransform.x - oldTransform.x * newZoom, newTransform.y - oldTransform.y * newZoom).scale(newZoom);
    d3.select(circuitAllG).attr("transform", `translate(${transform.x}, ${transform.y}) scale(${transform.z})`)

    //This is only for wires and bridges
    const circuitGs = circuitAllG.querySelectorAll("g:not(.currentG, .cBridgeG)");

    circuitGs.forEach(g => {
        const gClass = g.classList[0]

        while (g.children.length > 0) { //adoptNode removes the element from the circuit document
            //Calculates the correct coordinates for each element copied
            const child = g.children[0];

            addedElements.push(child);

            //const finalTransform = d3.zoomIdentity //merges relative transform with preexisting ones
            child.setAttribute("transform", (relativeTransform.toString() + " " + child.getAttribute("transform")).replace("null", "").trim())
            document.adoptNode(child);

            const wantedG = allG.node().querySelector(`.${gClass}`)
            wantedG.appendChild(child)                   
        }
    })

    //This is for the elements
    circuitAllG.querySelectorAll("foreignObject").forEach(element => {
        addedElements.push(element);
        addedElements.push(...element.querySelectorAll("*")) //adds the elements and their container (foreignObject)

        element.setAttribute("transform", ((relativeTransform.toString() + " " + element.getAttribute("transform")).replace("null", "").trim()));

        document.adoptNode(element);
        allG.node().appendChild(element);

        console.log(element.getBoundingClientRect())
        console.log(element.querySelector("*").getBoundingClientRect())
    });

    return addedElements; //keeps track of the pastedElements
}

function findElements(a, b, constant, isVertical) {
    //I am not sure this covers the case for rotated elements
    const step = Math.trunc(0.08 * document.body.clientHeight); //A safe value smaller than the size of the elements we are trying to find

    const elements = new Set();

    if (a > b) { //avoid code duplication
        return findElements(b, a, constant, isVertical);
    }

    for (a; a < b; a += step) {
        const point = isVertical ? {x: constant, y: a} : {x: a, y: constant};
        const foundElements = Array.from(document.elementsFromPoint(point.x, point.y)).filter(element => {
            const child = element.classList.contains(".userCreated");

            return child;
        })

        console.log(foundElements)

        if (foundElements.length > 0) {
            for (const el of foundElements) {
                elements.add(el);
            }
        }
    }

    return elements;
}

function findLines(element) { //this function assumes the element does not have any rotation applied to it
    const rect = element.getBoundingClientRect();
    const topLeft = {x: rect.left, y: rect.top};
    const topRight = {x: rect.left + rect.width, y: rect.top};
    const bottomLeft = {x: rect.left, y: rect.top + rect.height};
    const bottomRight = {x: rect.left + rect.width, y: rect.top + rect.height};

    return [{start: topLeft, end: topRight}, {start: topRight, end: bottomRight}, {start: bottomLeft, end: bottomRight}, {start: topLeft, end: bottomLeft}];
}

//This is a very important function
function removeElementFromData(element) {
    if (element.classList.contains("userCreated")) {
        //We need to remove every instance of this element from the programs data

        if (!element.classList.contains("wire")) {
            deleteElementFromAllElements(element);

            //clickedElements
            //May just be the same index as aEIndex (further testing required)
            const cEIndex = clickedElements.findIndex(object => object.element === element);

            if (cEIndex > -1) {
                clickedElements.splice(cEIndex, 1);
            } else {
                console.log("Error: Corrupted Data (clickedElements)");
            }

            //allObject
            const uniqueClass = Array.from(element.classList).find(className => className !== "userCreated");

            if (uniqueClass) {
                const aOIndex = allObject[uniqueClass].findIndex(object => object.element === element);

                if (aOIndex > -1) {
                    allObject[uniqueClass].splice(aOIndex, 1);
                } else {
                    console.log("Error: Corrupted Data (allObject)");
                }
            } else {
                console.log("Error: Corrupted Data (No unique class passed to a userCreated HTML Element)");
            }
        } else { 
            //wires  

            //We need to delete all the associated wires 
            const objectToDelete = wires.find(object => object.element === element);

            if (objectToDelete) {
                const wireGroupElements = wires.filter(object => object.wireGroup === objectToDelete.wireGroup)

                //No check required at least one object should be returned
                wires.splice(wires.indexOf(wireGroupElements[0]), wireGroupElements.length) //No check required
            } else {
                console.log("Error: Corrupted Data (wires)");
            }
        }
    }  //if not then it is the foreignObject container or current which should just be deleted, no need to adjust the data
}

function deleteOverlap(newElements) { //this function must be called before including the new elements to the data
    /*The plan is to make four lines in the perimeter and check them
      This is done in case I ever add rotation to elements as currently I just need 4 points*/

    const elementsToBeDeleted = new Set();

    newElements.forEach(element => {
        findLines(element).forEach(line => {
            const isVertical = line.start.x === line.end.x;
            const constant = isVertical ? line.start.x : line.start.y;

            const a = isVertical ? line.start.y : line.start.x;
            const b = isVertical ? line.end.y : line.end.x;

            const temp = findElements(a, b, constant, isVertical);

            if (temp.size > 0) {
                for (const el of temp) {
                    elementsToBeDeleted.add(el);
                }
            }

        })
    })

    Array.from(elementsToBeDeleted).filter(element => !newElements.includes(element)).forEach(element => {
        removeElementFromData(element);

        element.remove();
    })
}

export function pasteCircuit() {
    const allElementsId = JSON.parse(sessionStorage.getItem("allElementsId"))
    const allObjectId = JSON.parse(sessionStorage.getItem("allObjectId"))
    const wiresId = JSON.parse(sessionStorage.getItem("wiresId"))
    const circuitHTML = sessionStorage.getItem("circuitHTML")

    if (allElementsId && allObjectId && wiresId && circuitHTML) { //failsafe
        const screen = document.querySelector(".screen.visible")

        const newElements = pasteHTML(circuitHTML);

        /*Before filtering the data, we first push all the old data to the the current data
          To achieve this we must first convert ID data to something usable*/

        const newAllElements = processAllElementsId(allElementsId);
        const newWires = processWiresId(wiresId);
        const newAllObject = processAllObjectId(allObjectId);  

        /*We need to adjust the wire groups of the pasted elements so that there is no overlap
          this could be done after the overlaping elements get deleted, yet I believe this will be simpler
          and that leaving some wireGroups empty won't break the code*/

        const previousHeighestGroup = wireCounter;

        //Now we simply adjust the wireGroups of newWires by previousHeighestGroup + 1
        let previousGroup = -1;

        newWires.forEach(object => {
            if (previousGroup != object.wireGroup) {
                previousGroup = object.wireGroup;
                adjustWireCounter();
            }
            object.wireGroup += previousHeighestGroup + 1;
        })

        //We now add the new data to the old data
        wires.push(...newWires);

        newAllElements.forEach((element, object) => {
            allElements.set(element, object);

            const isNotConnection = !element.classList.contains("connection");
            clickedElements.push({ element, leftPoint: isNotConnection && object.connections.left.size > 0, rightPoint: isNotConnection && object.connections.right.size > 0 });
        })
        console.log(allElements)

        Object.keys(allObject).forEach(key => {
            allObject[key].push(...newAllObject[key]);
        })

        //Now we need to check if there is any overlap and remove those elements
        deleteOverlap(newElements)
    } else {
        console.log("ERROR: Failed to paste circuit")
    }
}