import * as d3 from "d3";

import { findAllPaths, breaks, allElements } from "./paths.js";
import { voltageSources } from "./voltage.js";
import { getPoints, getCenter, calculateDistance, replaceValueInAllElements } from "./commonFunctions.js";
import { wires, drawWirePointToPoint } from "./wires.js"
import { createCurrentBridge, findBridgePoints } from "./bridge.js";
import { currentG, allObject, screen } from "./management.js";

//const path = findAllPaths(voltageSources)

const body = document.body;

const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

export function drawCurrent(pathObject, isBreak = false) {
    console.log(breaks)
    if (pathObject.isClosed) {
        console.log(pathObject.color, pathObject.isClosed)
        const firstElement = pathObject.path[0].element

        const startPoints = getPoints(firstElement)

        let firstPoint;
        let lastPoint;

        if (isBreak) {
            //all breaks start and end with a connection
            firstPoint = startPoints.actualPoint

            const lastElement = pathObject.path[pathObject.path.length - 1].element

            lastPoint = getPoints(lastElement).actualPoint
        } else { //is the main path
            //If a main path was found succesfully then the first and last element should be the same
            firstPoint = startPoints.leftPoint
            lastPoint = startPoints.rightPoint
        }

        let nextSide;

        const allPoints = [firstPoint]
        for (let i = 1; i < pathObject.path.length - 1; i++) { //starts from second and stops at second to last element
            const element = pathObject.path[i].element

            if (!element) { //this means it reached a break
                allPoints.push("stop")

                const string = pathObject.path[i]

                const int = string.split("-")[1] //gets the integer

                breaks[int].forEach(newPathObject => {
                    drawCurrent(newPathObject, true)
                })

            } else {
                const side = pathObject.path[i].point

                const points = getPoints(element)

                const point = points[side]
                if (side !== "actualPoint") {
                    nextSide = side === "leftPoint" ? "rightPoint" : "leftPoint"
                } else {
                    nextSide = side
                }

                const nextPoint = points[nextSide]

                allPoints.push(point, nextPoint)
            }
        }

        allPoints.push(lastPoint)

        //since all points are in pairs, we use i += 2 to go to the next pair
        for (let i = 0; i < allPoints.length; i += 2) {
            const pointA = allPoints[i]
            const pointB = allPoints[i + 1]
            if (!(pointA === "stop" || pointB === "stop")) { //in reality only pointB can have the value of "stop" but it is more of a failsafe mechanism
                let start = pointA
               
                console.log(pointA, pointB)
                const intersectionPoints = findIntersectionsOnWireGroup(findWireGroup(pointA, pointB))
                console.log(intersectionPoints)

                for (let x = 0; x < intersectionPoints.length; x++) {
                    const bridgePoints = findBridgePoints(intersectionPoints[x], pointA, pointB)

                    const pointC = bridgePoints.pointA
                    const pointD = bridgePoints.pointB

                    createCurrentBridge(pointC, pointD, pathObject.color)

                    const d1 = calculateDistance(start, pointC)
                    const d2 = calculateDistance(start, pointD)

                    let end;

                    if (d1 < d2) {
                        end = pointC
                    } else {
                        end = pointD
                    }
                    currentG.append("path")
                    .attr("d", line([start, end]))
                    .attr("stroke", pathObject.color)
                    .classed("current", true);

                    start = end === pointC ? pointD : pointC
                }
                currentG.append("path")
                .attr("d", line([start, pointB]))  //generates the path for the two points
                .attr("stroke", pathObject.color)
                .classed("current", true);
            } else {
                //skips the break
                i++
            }
    }
    console.log(allPoints)
    }
    console.log(pathObject)
}

function findWireGroup(pointA, pointB) {
    //Passes the found wire elements into two arrays
    let wiresA = document.elementsFromPoint(pointA.x, pointA.y).filter(element => element.classList.contains("wire"))
    let wiresB = document.elementsFromPoint(pointB.x, pointB.y).filter(element => element.classList.contains("wire"))

    console.log(document.elementsFromPoint(pointB.x, pointB.y))
    console.log(document.elementsFromPoint(pointA.x, pointA.y))
    console.log(wiresA)
    console.log(wiresB)

  /*  //kati paei lathos
    d3.select(`#${screen.id} svg`).append("circle")
  .attr("cx", pointB.x)   // x position
  .attr("cy", pointB.y)   // y position
  .attr("r", 5)      // radius
  .attr("fill", "gold"); // color

      d3.select(`#${screen.id} svg`).append("circle")
  .attr("cx", pointA.x)   // x position
  .attr("cy", pointA.y)   // y position
  .attr("r", 5)      // radius
  .attr("fill", "gold"); // color
*/
    //Finds the general information about the specific wires
    wiresA = wires.filter(object => wiresA.includes(object.element))
    wiresB = wires.filter(object => wiresB.includes(object.element))

    //Finds the 
    const wireGroup = wiresA.filter(object => wiresB.some(object2 => object2.wireGroup === object.wireGroup))[0].wireGroup

    return wireGroup
}

function findIntersectionsOnWireGroup(wireGroup) {
    return wires.find(object => object.wireGroup === wireGroup).intersectionPoints
}

//Logic for amperometers
export const amperometers = () => allObject.amperometers;

function determinePoint(element, connectedElement) {
    let side;
    //Finds the element's object in the allElements array
    if (element.classList.contains("connection") || element.classList.contains("amperometer")) {
        side = "actualPoint"
    } else {
        const object = allElements.find(obj => obj.element === element)

        if (object.connections.left.includes(connectedElement)) {
            side = "leftPoint"
        } else {
            side = "rightPoint"
        }
    }

    return side
}



const handleClick = (event) => {
    const button = document.getElementById("amperometer");

    if (button.style.borderColor === "white") {
        if (event.target.classList.contains("wire")) {
            const wire = event.target

            const values = wires.find(object => object.element === wire)

            const connectedElements = values.connections
            const wireGroup = wires.filter(object => object.wireGroup === values.wireGroup).map(object => object.element)

            const side1 = determinePoint(connectedElements[0], connectedElements[1])
            const side2 = determinePoint(connectedElements[1], connectedElements[0])


            wireGroup.forEach(element => {
                const index = wires.findIndex(object => object.element === element)
                
                wires.splice(index, 1)

                element.remove()
            })

            const amperometer = document.createElement("div")
            screen.appendChild(amperometer)
            amperometer.classList.add("amperometer", "userCreated")
            amperometer.style.left = event.clientX - body.clientHeight * 0.02 + "px"
            amperometer.style.top = event.clientY - body.clientHeight * 0.02 + "px"

            const point1 = getPoints(connectedElements[0])[side1]
            const point2 = getPoints(connectedElements[1])[side2]

            const amperometerPoint = getCenter(amperometer)
        
            drawWirePointToPoint(point1, amperometerPoint)
            drawWirePointToPoint(amperometerPoint, point2)

            //Updates the allElements array
            replaceValueInAllElements(connectedElements[0], connectedElements[1], amperometer)
            replaceValueInAllElements(connectedElements[1], connectedElements[0], amperometer)

            allElements.push({element: amperometer, connections: {left: [connectedElements[0]], right: [connectedElements[1]]}})
        
            //updates the amperometers array
            amperometers().push({element: amperometer, connectedPath: null, resistance: {value: 0, UM: "(Ω)"}})
        }/* else {
            const goodClick = handleAllClicks("amperometer", amperometers, event, body.clientHeight * 0.02)

            if (goodClick) {
                const amperometer = amperometers.at(-1)

                amperometers[amperometers.length - 1] = {element: amperometer, connectedPath: null}
            }
        }*/
    }
}

export function addAmperometer() {
    body.addEventListener("click", handleClick)
}

export function removeAmperometer() {
    body.removeEventListener("click", handleClick)
}
