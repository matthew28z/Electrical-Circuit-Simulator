import { updateAllElements as update } from "./paths.js";
import { minimumValues } from "./management.js";
import { transform } from "../camera/move.js";

const body = document.body;
const screen = document.getElementById("screen");

export function handleAllClicks(elementID_Class, array, event, height = body.clientHeight * 0.1) {
    const button = document.getElementById(elementID_Class);
    const styles = window.getComputedStyle(button);

    if (event.target === screen && styles.borderColor === "rgb(255, 255, 255)") { //fail safe mechanism checking for border color
        
        const left = event.clientX - height / 2 - 2 //adjusts to center the element
        const top = event.clientY - height / 2 - 2 //since elements are squares with sides of 10% the body's height + 2

        const createdElement = document.createElement("div")
        screen.appendChild(createdElement)
        createdElement.classList.add(elementID_Class, "userCreated")

        createdElement.style.left = left + "px"
        createdElement.style.top = top + "px"

        array.push(createdElement)

        update(createdElement)

        return true
    }

    return false
}

export function removeAllClicks(func) {
    screen.removeEventListener("click", func)
}

export function calculateDistance(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y

    const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))

    return distance
}

export function getTopElements(start, end) {
    const elements = [];

    const step = 4

    const halfWidth = body.clientHeight * 0.01 //half the width of connection elements
    const failSafe = (4 * step + halfWidth) //4 is there to not get the first elements from a very narrow angle

    const points = [];

    let x1 = start.x
    let y1 = start.y

    let x2 = end.x
    let y2 = end.y

    const dx = x2 - x1
    const dy = y2 - y1

    const horizontalDistance = Math.abs(dx)
    const verticalDistance = Math.abs(dy)

    let x;
    let y;

    if (verticalDistance !== 0 && horizontalDistance !== 0) {
        let fix;
        let cotangent = horizontalDistance / verticalDistance
        //cotangent = dx / dy

        if (verticalDistance > horizontalDistance) {//verticalDistance > horizontalDistance, so for higher accuracy its better to have the y axis as a base 
            y = Math.min(y1, y2) + failSafe

            if (y1 < y2) {
                x = x1
                fix = x1 < x2 ? 1 : -1
            } else {
                x = x2
                fix = x1 > x2 ? 1 : -1
            }
            x += failSafe * cotangent * fix

            for (y; y < Math.max(y1, y2) - failSafe; y += step) {
                points.push({x: Math.round(x), y: Math.round(y)})
                x += step * cotangent * fix
            }

        } else { //horizontalDistance >= verticalDistance, so for higher accuracy its better to have the x axis as a base 
            x = Math.min(x1, x2) + failSafe
        
            if (x1 < x2) { 
                y = y1
                fix = y2 > y1 ? 1 : -1
            } else {
                y = y2
                fix = y2 < y1 ? 1 : -1
            }
            y += failSafe / cotangent * fix //keeps the points on the starting line

            for (x; x < Math.max(x1, x2) - failSafe; x += step) {
                points.push({x: Math.round(x) , y: Math.round(y)})
                y += step / cotangent * fix
            }
        }
        
    } else if (horizontalDistance === 0) {
        y = Math.min(y1, y2)
        x = x1 //x1 === x2

        for (y; y < Math.max(y1, y2); y += step) {
            points.push({x: Math.round(x), y: Math.round(y)})
        }
    } else { //verticalDistance === 0
        x = Math.min(x1, x2)
        y = y1 //y1 === y2

        for (x; x < Math.max(x1, x2); x += step) {
            points.push({x: Math.round(x), y: Math.round(y)})
        }
    }

    points.forEach(point => {
        const foundElement = document.elementsFromPoint(point.x, point.y)[0]
        
        elements.push(foundElement)
    })

    return {points: points, elements: elements}// part of debugging
    //console.log(elements)
    //return elements
}

export function findAbsCotangent(start, end) {
    const x1 = start.x
    const y1 = start.y
    
    const x2 = end.x
    const y2 = end.y

    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)
        
    const cotangent = dx / dy

    return cotangent
}

function getCenter(element) {
    const rect = element.getBoundingClientRect()

    const left = rect.left + rect.width / 2 + window.scrollX + transform.x
    const top = rect.top + rect.height / 2 + window.scrollY + transform.y
    return { x: left, y: top }
}

export function getPoints(element) {
    const rect = element.getBoundingClientRect()

    const x1 = rect.left + window.scrollX + transform.x
    const x2 = rect.left + window.scrollX + rect.width + transform.x
    const y1 = rect.top + window.scrollY + rect.width / 2 + transform.y
    const y2 = rect.top + window.scrollY + rect.width / 2 + transform.y

    let x3 = null
    let y3 = null
    if (element.classList.contains("connection")) { //for connections all points are on the center (i.e. actualPoint)
        const center = getCenter(element)
        x3 = center.x
        y3 = center.y
    }
 
    return { leftPoint: { x: x1, y: y1 }, rightPoint: { x: x2, y: y2 }, actualPoint: { x: x3, y: y3 } }
}


export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function userCreatedTab(element, array) {
    const object = array.find(object => object.element === element)
    const hasTab = object.hasTab

    if (!hasTab) {
        const popUp = positionAndSizeTab(element, array)

        const rect = popUp.getBoundingClientRect()

        shapeTab(popUp, rect)

        const close = addCloseButton(popUp, rect, object)

        fillTab(popUp, rect, close, element, array, object)

        object.hasTab = true

        return popUp
    } 

    return null
}

function positionAndSizeTab(element, array) {
    const rect = element.getBoundingClientRect()

    const left = rect.left + rect.width * 0.8 + "px"
    const top = rect.top

    const popUp = document.createElement("div")
    screen.appendChild(popUp)
    popUp.classList.add("popUp")
    popUp.style.height = 9 * (Object.keys(array[0]).length) + "%"

    const tabRect = popUp.getBoundingClientRect()
    
    popUp.style.left = left
    popUp.style.top = top - tabRect.height + "px"

    return popUp
}

function shapeTab(tab, rect) {
    //creates the wanted shape using the d3 library
    const div = d3.select(tab)
    const svg = div.append("svg")
    .attr("width", rect.width)
    .attr("height", rect.height)

    svg.append("polygon") 
    .attr("points", `0,0 
                    ${rect.width},0 
                    ${rect.width},${rect.height * 0.8} 
                    ${rect.width * 0.3},${rect.height * 0.8} 
                    0,${rect.height} 
                    ${rect.width * 0.1},${rect.height * 0.8} 
                    0,${rect.height * 0.8}`)
    .attr("fill", "whitesmoke")
    .attr("stroke", "gainsboro")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round");
}

function addCloseButton(tab, rect, object) {
    //Adds a close button
    const close = document.createElement("button")
    tab.appendChild(close)
    close.classList.add("Xbutton")

    const closeRect = close.getBoundingClientRect()
    close.style.left = rect.width - closeRect.width - 4 + "px"

    close.addEventListener("click", () => {
        object.hasTab = false 

        tab.remove()
    })

    return close
}

function fillTab(tab, rect, closeButton, element, array, object) {
    const entries = Object.entries(object)
    entries.shift()
    entries.pop()
    console.log(entries)

    const xRect = closeButton.getBoundingClientRect()

    const height = (rect.height * 0.4 - xRect.height) / (entries.length)
    
    entries.forEach((entry, index) => {
        const div = document.createElement("div")
        tab.appendChild(div)
        div.classList.add("subTab")
        div.style.height = height + "px"
        div.style.top = height * index + xRect.height + "px"

        if (index !== 0) {
            div.style.borderTop = "none"
        }

        const p = document.createElement("p")
        div.appendChild(p)

        p.innerHTML = entry[0] + entry[1].UM + ":" 

        const pRect = p.getBoundingClientRect()
        
        const input = document.createElement("input")
        div.appendChild(input)
        input.width = rect.width - 8 - pRect.width + "px"

        const value = entry[1].value

        input.value = value ? value : 0
        input.type = "number"

        const min = minimumValues[entry[0]]
        input.min = min

        input.addEventListener("input", (event) => {
            const value = Number(event.target.value)

            if (value >= min) {
                object[entry[0]].value = value
            } else {
                event.target.value = min
                object[entry[0]].value = min
            }
        })
    })
}