import { wireG, bridgeG, cBridgeG, currentG, fakeWireG, allG} from "../logic/management.js"
import { transform } from "../camera/move.js";
import { processAllElementsId, processAllObjectId, processWiresId } from "./commonFunctions.js";
import { adjustWireCounter, wireCounter } from "../logic/wires.js";


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
    //Converts the raw text data into an HTML that can be processed easily
    const parser = new DOMParser();
    const circuit = parser.parseFromString(circuitHTML, "text/html"); //This represents the circuit as HTML
   
    const circuitAllG = circuit.querySelector(".allG");
    const oldTransform = d3.zoomTransform(circuitAllG);
    //Wraps the object with D3
    const oldTransformD3 = d3.zoomIdentity.translate(oldTransform.x, oldTransform.y).scale(oldTransform.k);

    /*Some math I didn't get my head into that much, used AI and d3 to understand them
      Basically the goal is to change the coords of each element to something that 
      will fit perfectly in the new allG. I did not try to find a solution for how the zoom would 
      accounted for as that is not really the focus of the project, and I have already resorted to D3 in the past*/
    const newTransformD3 = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.z);
    //old coords -> world coords -> relative coords
    const relativeTransform = oldTransformD3.invert().translate(newTransform.x, newTransform.y).scale(newTransform.k);
    console.log(7)
    circuitAllG.attr("transform", `translate(${transform.x}, ${transform.y}) scale(${transform.z})`)
    console.log(8)

    const circuitGs = circuitAllG.querySelectorAll("g");
    console.log(9)

    circuitGs.forEach(g => {
        console.log(10)
        const gClass = g.classList[0]
        console.log(11)

        while (g.children.length > 0) { //adoptNode removes the element from the circuit document
            
            //Calculates the correct coordinates for each element copied
            const child = g.children[0];

            const finalTransform = relativeTransform.compose(d3.zoomTransform(child)) //merges relative transform with preexisting ones
            child.setAttribute("transform", finalTransform.toString())
            document.adoptNode(child);

            const wantedG = allG.querySelector(`.${gClass}`)
            wantedG.appendChild(child)                   
        }
    })

}

export function pasteCircuit() {
    const allElementsId = JSON.parse(sessionStorage.getItem("allElementsId"))
    const allObjectId = JSON.parse(sessionStorage.getItem("allObjectId"))
    const wiresId = JSON.parse(sessionStorage.getItem("wiresId"))
    const circuitHTML = sessionStorage.getItem("circuitHTML")

    if (allElementsId && allObjectId && wiresId && circuitHTML) { //failsafe
        const screen = document.querySelector(".screen.visible")

        pasteHTML(circuitHTML);

        /*Before filtering the data, we first push all the old data to the the current data
          To achieve this we must first convert ID data to something usable*/

        const newAllElements = processAllElementsId(allElementsId);
        const newAllObject = processAllObjectId(allObjectId);  
        const newWires = processWiresId(wiresId);

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
        allElements.push(...newAllElements);
        allObject.keys.forEach(key => {
            allObject[key].push(...newAllObject[key]);
        })
    } else {
        console.log("ERROR: Failed to paste circuit")
    }
}