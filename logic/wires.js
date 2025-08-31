import { removeAllClicks, calculateDistance, getTopElements as getAllElements, getPoints } from "./commonFunctions.js";
import { createBridge, findBridgePoints } from "./bridge.js"
import { updateAllElements, allElements } from "./paths.js"
import { connections } from "./connection.js"
import { wireG, fakeWireG } from "./management.js"

const body = document.body;
const screen = document.getElementById("screen");
const svg = d3.select("#overlay");
const root = document.documentElement;

let wireCounter = 0;
let hasClicked = false;
//Clicked Elements is a less detailed version of the allElements array that makes parts of the code quicker
export const clickedElements = []; //is meant to have this form [{element: an element, leftPoint: boolean, rightPoint: boolean}]
const currentClickedElements = [];
let pastClickedElement;

export const wires = [];// is meant to have this form [{element: an element, conections: an array, wireGroup: an integer, notConnected: boolean}]

const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

function extraCheck(knownElement, unknownElement, scenario, isFirstElement = true) {
    let result;

    /*Scenario signifies the point we do not want a connection to be made
      on the knownElement, thus value flips it. The logic is the opposite for connections*/ 
    
    let value; 
    let point;

    value = scenario === "leftPoint" ? "rightPoint" : "leftPoint"
    if (knownElement.classList.contains("connection")) {
        point = getPoints(knownElement).actualPoint //connections in reality only have one point
    } else {  
        point = getPoints(knownElement)[value]
    }
    const otherPoints = getPoints(unknownElement)

    const d1 = calculateDistance(point, otherPoints.leftPoint) //distance to left
    const d2 = calculateDistance(point, otherPoints.rightPoint) //distance to right
    //console.log(`distance to left: ${d1}`)
    //console.log(`distance to right: ${d2}`)
    if (d1 >= d2) { //rightPoint is closer
        if (isFirstElement) {
            result = value === "leftPoint" ? "case1" : "case4" //checked
            //console.log("01")
            //console.log(value)
        } else {
            result = value === "leftPoint" ? "case2" : "case4" //checked
            //console.log("02")
        }
    } else { //leftPoint is closer
        if (isFirstElement) {
            result = value === "leftPoint" ? "case3" : "case2" //checked
            //console.log("03")
        } else {
            result = value === "leftPoint" ? "case3" : "case1" //checked
            //console.log("04")
        }
    }

    return result
}

function determine(element1, element2, tF = false, scenario = null) {
    let result;

    if (tF) {
        if (scenario === 1) { //left1
            result = extraCheck(element1, element2, "leftPoint")
        } else if (scenario === 2) { //right1
            result = extraCheck(element1, element2, "rightPoint")
        } else if (scenario === 3) { //left2
            result = extraCheck(element2, element1, "leftPoint", false)
        } else { //right2
            result = extraCheck(element2, element1, "rightPoint", false)
        }
    } else {
        const rect1 = element1.getBoundingClientRect()
        const rect2 = element2.getBoundingClientRect()


        const dx = rect1.left - rect2.left

        if (dx > element1.clientWidth + 5) { //element1 is on the right
            result = "case1" //left to right
        } else if (dx < element1.clientWidth * (-1) - 5) { //element2 is on the right
            result = "case2" //right to left
        } else { //they are on the same vertical line
            result = "case3" //left to left
        }
    }

    return result
}

function choosePoints(element1, element2) {
    let result; //"case1" will resemble left to right point connection, "case2" will be the opposite, "case3" will be left to left and "case4" right to right

    const isCon1 = element1.classList.contains("connection")
    const isCon2 = element2.classList.contains("connection")

    let testDebug;
    if (!(isCon1 || isCon2)) {
        const i1 = clickedElements.findIndex(object => object.element === element1)
        const i2 = clickedElements.findIndex(object => object.element === element2)

        let left1;
        let right1;
        let left2;
        let right2;

        //checks if any connections have already been made
        left1 = clickedElements[i1].leftPoint
        right1 = clickedElements[i1].rightPoint
        left2 = clickedElements[i2].leftPoint
        right2 = clickedElements[i2].rightPoint


        if (left1 && left2) {
            result = "case4" //right to right
            testDebug = 1
        } else if (right1 && right2) {
            result = "case3" //left to left
            testDebug = 2
        } else if (left1 && right2) {
            result = "case2" //right to left
            testDebug = 3
        } else if (left2 && right1) {
            result = "case1" //left to right
        } else if (left1) { // || right1 || left2 || right2
            result = determine(element1, element2, true, 1)
            testDebug = 4
        } else if (right1) {
            result = determine(element1, element2, true, 2)
            testDebug = 5
        } else if (left2) {
            result = determine(element1, element2, true, 3)
            testDebug = 6
        } else if (right2) {
            result = determine(element1, element2, true, 4)
            testDebug = 7
        } else { //no connections have been made
            result = determine(element1, element2)
            testDebug = 8
        //console.log(testDebug)
        }
    } else if (isCon1 && isCon2) {
        //Sockets only make connections on their leftPoint whilst Plugs only make connections on their rightPoint
        const index1 = connections.findIndex(object => object.element === element1)
        const index2 = connections.findIndex(object => object.element === element2)

        const state1 = connections[index1].state
        const state2 = connections[index2].state

        if (state1 === "socket") {
            if (state2 === "socket") {
                result = "case3"
                testDebug = 9
            } else {
                result = "case1"
                testDebug = 10
            }
        } else {
            if (state2 === "socket") {
                result = "case2"
                testDebug = 11
            } else {
                result = "case4"
                testDebug = 12
            }
        }
    } else if (isCon1) {
        const index = connections.findIndex(object => object.element === element1)
        const state = connections[index].state
        
        const i = clickedElements.findIndex(object => object.element === element2)

        const left = clickedElements[i].leftPoint
        const right = clickedElements[i].rightPoint

        if (state === "socket") {// left - 
            if (right) { // left - left
                result = "case3"
                testDebug = 13
            } else if (left) { // left - right
                result = "case1"
                testDebug = 14
            } else {// left - 
                //2 is passed as a parameter so that a connection will be made on the left
                result = determine(element1, element2, true, 2)
                testDebug = 15
            }
        } else {// right - 
            if (right) {// right - left
                result = "case2"
                testDebug = 16
            } else if (left) {// right - right
                result = "case4"
                testDebug = 17
            } else {// right - 
                //1 is passed as a parameter so that a connection will be made on the right
                result = determine(element1, element2, true, 1)
                testDebug = 18
            }
        }
    } else { //isCon2
        const index = connections.findIndex(object => object.element === element2)
        const state = connections[index].state
        console.log(state)

        const i = clickedElements.findIndex(object => object.element === element1)

        const left = clickedElements[i].leftPoint
        const right = clickedElements[i].rightPoint

        if (state === "socket") {//  - left
            if (left) {// right - left
                result = "case2"
                testDebug = 19
            } else if (right) {// left - left
                result = "case3"
                testDebug = 20
            } else {//  - left
                //4 is passed as a parameter so that a connection will be made on the left
                result = determine(element1, element2, true, 4)
                testDebug = 21
            }
        } else {//  - right
            if (left) {// right - right
                result = "case4"
                testDebug = 22
            } else if (right) {// left - right
                result = "case1"
                testDebug = 23
            } else {//  - right
                //3 is passed as a parameter so that a connection will be made on the right
                result = determine(element1, element2, true, 3)
                testDebug = 24
            }
           
        }
    }

    //console.log(testDebug)

    return result
}

/*
function findMidPoint(start, end) {
    let midPoint = {x: (start.x + end.x) / 2 + randomNumber(-50, 50), y: (start.y + end.y) / 2 + randomNumber(-50, 50)}

    let intersection = checkIntersection(start, midPoint) && checkIntersection(midPoint, end)

    let i = 0

    while(intersection) {
        const plusX = randomNumber(-50, 50)
        const plusY = randomNumber(-50, 50)

        let tf1 = checkIntersection(start, midPoint)
        let tf2 = checkIntersection(midPoint, end)

        console.log("tf1 " + tf1)
        console.log("tf2 " + tf2)

        midPoint.x += plusX
        midPoint.y += plusY

        intersection = checkIntersection(start, midPoint) && checkIntersection(midPoint, end)
        i++
    }

    console.log(i + " attempts")

    return midPoint
}*/

function keepTrack(element, point, otherElement) {
    const i = clickedElements.findIndex(object => object.element === element)
    const side = point === "leftPoint" ? "left" : "right"

    if (i !== -1) {
        if (element.classList.contains("connection")) { //connections only have one point
            clickedElements[i][point] = true
        } else {
            clickedElements[i][point] = true
        }
        updateAllElements(element, otherElement, side)
    } else {
        console.log("problem")
    }
}

function checkIntersection(start, end) {
    const values = getAllElements(start, end)
    const intersectedElements = values.elements
    const points = values.points

    let intersection = false

    const intersectionPoints = []

    //let failSafe = null; 

    for (let i = 0; i < intersectedElements.length; i++) {
        const element = intersectedElements[i]

        if (element.classList.contains("wire")) {
            intersection = true

            intersectionPoints.push(points[i])

            /*Bridges have a radius of 10 pixels whilst each sample-point has 4 pixels distance from 
              the previous/next sample-point. Also the sample-points are meant to be the centers of 
              the bridge. Thus when a bridge is created in sample-point N we should jump to 
              sample-point N + 3 to avoid bridges over lapping eachother, since 3 * 4 = 12 > 10
              (basically creating a minimum of two pixels between each bridge).*/
            i += 2 /*Since we want to go to i + 3, we should only add 2 to i because at the end 
                    of each iteration i is increased by 1.*/       
        }
    } 

    //Sorts the array in ascending order, based on the point's distance to start
    intersectionPoints.sort((a, b) => calculateDistance(a, start) - calculateDistance(b, start))
    /*Here the find distance function, which calculates the 2D distance between two points is overkill
      since we know that all points are on the same line and thus could only compare dx or dy values
      (1D) to achieve the same result*/

    return {intersection: intersection, intersectionPoints: intersectionPoints}
}

function blockWireCreation(element1, element2, scenario) {
    const index1 = clickedElements.findIndex(object => object.element === element1)
    const index2 = clickedElements.findIndex(object => object.element === element2)

    //Only connections are allowed to have more than one wire connected to each point
    const hasNoMorePoints1 = element1.classList.contains("connection") ? false : (clickedElements[index1].leftPoint && clickedElements[index1].rightPoint)
    const hasNoMorePoints2 = element2.classList.contains("connection") ? false : (clickedElements[index2].leftPoint && clickedElements[index2].rightPoint)
    
    let block = false;
    
    if (hasNoMorePoints1 || hasNoMorePoints2) {
        block = true
    } else {
        let side1;
        let side2;
        if (scenario === "case1") {
            side1 = "left"
            side2 = "right"
        } else if (scenario === "case2") {
            side1 = "right"
            side2 = "left"
        } else if (scenario === "case3") {
            side1 = "left"
            side2 = "left"
        } else {
            side1 = "right"
            side2 = "right"
        }

        const index1 = allElements.findIndex(object => object.element === element1)
        const index2 = allElements.findIndex(object => object.element === element2)

        const already1 = allElements[index1].connections[side1].includes(element2)
        const already2 = allElements[index2].connections[side2].includes(element1)

        if (already1 && already2) {
            block = true
        }
    } 

    return block
}

function drawBridges(values, start, end, isFake = false) {
    const intersectionPoints = values.intersectionPoints
/*
const ds = []
intersectionPoints.forEach(point => {
    ds.push(findDistance(point, start))
})
            
for (let i = 0; i < ds.length; i++) {
    const d = ds[i]
    for (let x = i + 1; x < ds.length; x++) {
        if (d < ds[x]) {
            console.log(true)
        } else {
            console.log(false)
        }
    }*/

    const intersections = intersectionPoints.length

    let lineStart = start

    let otherPoint;

    for (let i = 0; i < intersections; i++) {
        const point = intersectionPoints[i]

        const newPoints = findBridgePoints(point, start, end)
        const pointA = newPoints.pointA
        const pointB = newPoints.pointB

        createBridge(pointA, pointB, isFake, intersectionPoints)

        const d1 = calculateDistance(lineStart, pointA)
        const d2 = calculateDistance(lineStart, pointB)

        let pathData;

        if (d1 < d2) {
            pathData = line([lineStart, pointA])
            otherPoint = pointB
        } else {
            pathData = line([lineStart, pointB])
            otherPoint = pointA
        }

        lineStart = otherPoint

        if (!isFake) {
            const wire = wireG.append("path")
            .attr("d", pathData)
            .attr("stroke", "silver")
            .attr("stroke-width", 5)
            .attr("class", "wire")
            .attr("fill", "none")
            .attr("stroke-linecap", "round"); 

            wires.push({element: wire.node(), connections: [], intersections: intersectionPoints})
        } else {
            fakeWireG.append("path")
            .attr("d", pathData)
            .attr("stroke", "silver")
            .attr("stroke-width", 5)
            .attr("class", "wire")
            .attr("fill", "none")
            .classed("fakeWire", true)
            .attr("stroke-linecap", "round"); 
        } 
    }
    const pathData2 = line([lineStart, end])

    if (!isFake) {
        const wire = wireG.append("path")
        .attr("d", pathData2)
        .attr("stroke", "silver")
        .attr("stroke-width", 5)
        .attr("class", "wire")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");  

        wires.push({element: wire.node(), connections: [], intersectionPoints: intersectionPoints})
    } else {
        fakeWireG.append("path")
        .attr("d", pathData2)
        .attr("stroke", "silver")
        .attr("stroke-width", 5)
        .attr("class", "wire")
        .attr("fill", "none")
        .classed("fakeWire", true)
        .attr("stroke-linecap", "round");  
    }

    //wire represents a d3 selection of the element, thus to get the element we use .node()
}

function drawWires(element1, element2, scenario) {
    const element1Points = getPoints(element1)
    const element2Points = getPoints(element2)

    const block = blockWireCreation(element1, element2, scenario)

    if (!block) {
        let start;
        let end;

        const isConnection1 = element1.classList.contains("connection")
        const isConnection2 = element2.classList.contains("connection")

        if (scenario === "case1") {
            start = isConnection1 ? element1Points.actualPoint : element1Points.leftPoint
            end = isConnection2 ? element2Points.actualPoint : element2Points.rightPoint

            keepTrack(element1, "leftPoint", element2)
            keepTrack(element2, "rightPoint", element1)
        } else if (scenario === "case2") {
            start = isConnection1 ? element1Points.actualPoint : element1Points.rightPoint
            end = isConnection2 ? element2Points.actualPoint : element2Points.leftPoint

            keepTrack(element1, "rightPoint", element2)
            keepTrack(element2, "leftPoint", element1)
        } else if (scenario === "case3") {
            start = isConnection1 ? element1Points.actualPoint : element1Points.leftPoint
            end = isConnection2 ? element2Points.actualPoint : element2Points.leftPoint

            keepTrack(element1, "leftPoint", element2)
            keepTrack(element2, "leftPoint", element1)
        } else {
            start = isConnection1 ? element1Points.actualPoint : element1Points.rightPoint
            end = isConnection2 ? element2Points.actualPoint : element2Points.rightPoint

            keepTrack(element1, "rightPoint", element2)
            keepTrack(element2, "rightPoint", element1)
        }

        //const midPoint = findMidPoints(start, end)

        //checks whether wires will intersect
        const values = checkIntersection(start, end)

        drawBridges(values, start, end)

        /*//test for whether getAllElements followed the right path
        const valuess = getAllElements(start, end)
        const points = valuess.points
        //console.log(values)

        points.forEach(point => {
        svg.append("circle")
        .attr("cx", point.x)
        .attr("cy", point.y)
        .attr("r", 1)          
        .attr("fill", "gold");
        })*/
        /*                
       svg.append("circle")
       .attr("cx", midPoint.x)
       .attr("cy", midPoint.y)
       .attr("r", 10)          
       .attr("fill", "gold"); */

       //Changes new elements
       let intersectionPoints;
       wires.forEach(object => {
        if (object.connections.length === 0) {
            object.connections.push(element1, element2)
            object["wireGroup"] = wireCounter
            object["notConnected"] = false
        }
       })
       wireCounter++
    } else {
        alert("no")
    }      
}

function drawFakeWire(element, mousePoint) {
    let start;

    if (element.classList.contains("connection")) {
        start = getPoints(element).actualPoint
    } else {
        const index = clickedElements.findIndex(object => object.element === element)

        const left = clickedElements[index].leftPoint
        const right = clickedElements[index].rightPoint

        const points = getPoints(element)
        if (!(left && right)) { //does not allow unwanted connections
            if (left) {
                start = points.rightPoint
            } else if (right) {
                start = points.leftPoint
            } else {
                const dL = calculateDistance(points.leftPoint, mousePoint)
                const dR = calculateDistance(points.rightPoint, mousePoint)

                if (dL < dR) {
                    start = points.leftPoint
                } else {
                    start = points.rightPoint
                }
            }
        }
    }

    if (start) {
        const values = checkIntersection(start, mousePoint)

        drawBridges(values, start, mousePoint, true)
    }

}

const handleMove = (event) => {
    const wireButton = document.getElementById("wire")

    if (wireButton.style.borderColor === "white") {
        const mousePoint = {x: event.clientX, y: event.clientY}

        removeFakeWires()
        if ((event.target.classList.contains("userCreated") || event.target.classList.contains("wire") || event.target === screen)) {         
            const element = currentClickedElements[currentClickedElements.length - 1]

            drawFakeWire(element, mousePoint)

            document.addEventListener("mouseleave", handleOut)
        } else {
            document.removeEventListener("mouseleave", handleOut)
        }
    } else {
        screen.removeEventListener("mousemove", handleMove)
        unselect()
    }
}

const handleOut = (event) => {
    removeFakeWires()
}

const handleClicks = (event) => {
    let closedLoop = false; //keeps track of whether the circuit is closed

    if (event.target.classList.contains("userCreated")) {
        const clickedElement = event.target
        currentClickedElements.push(clickedElement)

        body.addEventListener("mousemove", handleMove)

        if (clickedElements.findIndex(object => object.element === clickedElement) === -1) { //only adds new elements
            if (clickedElement.classList.contains("connection")) {
                clickedElements.push({element: clickedElement, leftPoint: true, rightPoint: true})
            } else {
                clickedElements.push({element: clickedElement, leftPoint: false, rightPoint: false})
            }
        }

        if (hasClicked) { //the user has clicked on some element 
            removeFakeWires()

            if (pastClickedElement === clickedElement) { //the user clicked the same element twice
                hasClicked = false
                closedLoop = true
                /*
                if (pastClickedElement.classList.contains("connection")) {
                    pastClickedElement.style.backgroundColor = "gold" //adjusts 
                } else {
                    pastClickedElement.style.borderColor = "transparent" //adjusts  
                }*/
                console.log("test2")
                //clickedElements.length = 0
            } else {
                if (pastClickedElement.classList.contains("connection")) {
                    pastClickedElement.style.borderColor = "silver" //adjusts 
                } else {
                    pastClickedElement.style.borderColor = "transparent" //adjusts  
                }
                    //clickedElements.forEach(object => {
                if (currentClickedElements[0] === clickedElement && currentClickedElements.length !== 1) {
                    hasClicked = false //resets if the loop is closed
                    closedLoop = true
                    //clickedElements.length = 0
                } 
                //a more modern solution
                drawWires(pastClickedElement, clickedElement, choosePoints(pastClickedElement, clickedElement))
                
                if (closedLoop) {
                    currentClickedElements.length = 0
                    //completely removes the event listener
                    body.removeEventListener("mousemove", handleMove)
                }
                //connectPoints(pastClickedElement, clickedElement)
                //})
            }
        } else { //the user has not clicked on any element yet
            hasClicked = true

            body.addEventListener("mousemove", handleMove)
        }
        if (clickedElement.classList.contains("connection")) {
            clickedElement.style.setProperty("border-color", closedLoop ? "silver" : "lightBlue", "important")
        } else {
            clickedElement.style.borderColor = closedLoop ? "transparent" : "gold" //adjusts  
        }
        pastClickedElement = clickedElement //resets
        //hasClicked = !hasClicked 
    } else if (event.target === screen) {
        unselect()
    }
}

export function addWire() {
    screen.addEventListener("click", handleClicks)
}

export function removeWire() {
    removeAllClicks(handleClicks)
}

function removeFakeWires() {
    fakeWireG.selectAll("*").remove()
}

//Event Listener for element unselection
function unselect() {
    body.removeEventListener("mousemove", handleMove)
    removeFakeWires()

    const lastElement = currentClickedElements[currentClickedElements.length - 1]

    if (lastElement) {
        hasClicked = false

        if (lastElement.classList.contains("connection")) {
            lastElement.style.setProperty("border-color", "silver", "important")
        } else {
            lastElement.style.borderColor = "transparent"
        }

        currentClickedElements.length = 0
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        unselect()
    }
})








/* A Handcrafted Solution Without Fail Checks
function connectPoints (elementA, elementB) {
    //creates two lines that are the wires
    const horizontalWire = document.createElement("div")
    body.appendChild(horizontalWire)
    horizontalWire.classList.add("wire")
    horizontalWire.style.height = "5px"
    horizontalWire.style.top = elementA.offsetTop + elementA.clientHeight / 2 + "px" //adjusts
    
    //checks horziontal direction
    const distanceX = elementB.offsetLeft - elementA.offsetLeft
    const newWidth = Math.abs(distanceX)

    if (distanceX > 0) { //elemetB is on the right
        horizontalWire.style.width = newWidth - elementA.clientWidth + "px"
        horizontalWire.style.left = elementA.offsetLeft + elementA.clientWidth + "px"//adjusts 
    } else if (distanceX < 0) { //elementB is on the left
        horizontalWire.style.width = newWidth - elementB.clientWidth + "px"
        horizontalWire.style.left = elementB.offsetLeft + elementB.clientWidth + "px"
    } 

    const verticalWire = document.createElement("div")
    body.appendChild(verticalWire)
    verticalWire.classList.add("wire")
    verticalWire.style.width = "5px"
    verticalWire.style.left = (distanceX > 0 ? horizontalWire.offsetLeft + horizontalWire.clientWidth - verticalWire.clientWidth : horizontalWire.offsetLeft) + "px"
    console.log((distanceX > 0 ? (body.clientWidth - horizontalWire.offsetLeft - horizontalWire.clientWidth - verticalWire.clientWidth) : horizontalWire.offsetLeft) + "px")
    //checks vertical direction
    const distanceY = elementB.offsetTop - elementA.offsetTop
    const newHeight = Math.abs(distanceY)

    if (distanceY > 0) { //elementB is on the bottom
        verticalWire.style.height = newHeight + "px"
        //verticalWire.style.top = horizontalWire.offsetTop + "px"
         verticalWire.style.top = horizontalWire.offsetTop + horizontalWire.clientHeight + "px"
        console.log("panw")
    } else if (distanceY < 0) { //elementB is on the top
        verticalWire.style.height = newHeight + "px"
        verticalWire.style.top = horizontalWire.offsetTop - verticalWire.clientHeight + "px"
        console.log("katw")
    }
}
*/