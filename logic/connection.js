import { handleAllClicks, removeAllClicks } from "./commonFunctions.js";
import { allObject } from "./management.js"

const body = document.body;
const screen = document.getElementById("screen");

export const connections = allObject.connections;

const handleClick = (event) => {
    const goodClick = handleAllClicks("connection", connections, event, body.clientHeight * 0.02)

    if (goodClick) { //new element was added
        connections[connections.length - 1] = {element: connections[connections.length - 1], state: "socket", resistance: 0}
        //The function above adds the newest element to the connections array
        const connection = connections[connections.length - 1].element

        connection.addEventListener("mousedown", handleMouseClick)
    }
}

export function addConnection() {
    screen.addEventListener("click", handleClick)
}


export function removeConnection() {
    removeAllClicks(handleClick)
}

function handleMouseClick(event) {
    if (event.button === 2) {
        const color = window.getComputedStyle(this).backgroundColor === "rgb(255, 215, 0)" /*gold*/ ? "gold" : "purple"

        this.style.backgroundColor = color === "gold" ? "purple" : "gold"

        const index = connections.findIndex(object => object.element === this)
        //color holds the old value, thus the logic is flipped because the acrtual background color has already changed
        connections[index].state = color === "gold" ? "plug" : "socket"
    
    /* An option for a popUp menu (avoided due to inconsistencies)
    const rect = this.getBoundingClientRect()

    const left = rect.left + rect.width * 0.8 + "px"
    const top = rect.top 

    const popUp = document.createElement("div")
    body.appendChild(popUp)
    popUp.classList.add("popUp")

    const thisRect = popUp.getBoundingClientRect()
    popUp.style.left = left
    popUp.style.top = top - thisRect.height + "px"

    //creates the wanted shape using the d3 library
    const div = d3.select(popUp)
    const svg = div.append("svg")
    .attr("width", thisRect.width)
    .attr("height", thisRect.height)

    svg.append("polygon") 
    .attr("points", `0,0 ${thisRect.width},0 ${thisRect.width},${thisRect.height * 0.8} ${thisRect.width * 0.2},${thisRect.height * 0.8} 0,${thisRect.height}`)
    .attr("fill", "whitesmoke")
    .attr("stroke", "gainsboro")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round");

    //Adds a close button
    const close = document.createElement("button")
    popUp.appendChild(close)
    close.classList.add("Xbutton")

    const closeRect = close.getBoundingClientRect()
    close.style.left = thisRect.width - closeRect.width - 4 + "px"

    close.addEventListener("click", () => {
        popUp.remove()
    })

    //adds explaining text
    const text = document.createElement("p")
    popUp.appendChild(text)
    text.style.fontSize = thisRect.width * 0.1 + "px"

    const index = connections.findIndex(object => object.element === this)
    text.innerHTML = `Connection currently is a ${connections[index].state}` 

    const toggle = document.createElement("button")
    popUp.appendChild(toggle)
    toggle.classList.add("toggle")

    toggle.style.fontSize = text.style.fontSize
    toggle.innerHTML = "Change State"
    const toggleRect = toggle.getBoundingClientRect()

    text.style.bottom = thisRect.height * 0.25 + (thisRect.height * 0.8 - closeRect.height - text.clientHeight) / 2 + "px"

    toggle.addEventListener("click", () => {
        connections[index].state = connections[index].state === "socket" ? "plug" : "socket"

        text.innerHTML = `Connection currently is a ${connections[index].state}` 

        this.style.backgroundColor = connections[index].state === "socket" ? "gold" : "purple"
    })*/
    }
}
