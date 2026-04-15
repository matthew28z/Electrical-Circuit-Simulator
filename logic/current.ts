import * as d3 from "d3";

import { currentPathData, pathObject, AE, breaks, currentColor, allElements } from "./paths";
import { cBridgeG, currentG, allG, allObject } from "./management.js";
import { getPoints, getCenter, replaceValueInAllElements } from "./commonFunctions.js";
import { wires, drawWirePointToPoint } from "./wires.js";
import { findBridgePoints, createCurrentBridge } from "./bridge";

type line = d3.Line<point>
type point = { x: number, y: number };
type pointData = { belongsTo: HTMLElement, point: point };
type pair = [pointData, pointData];

const line : line  = d3.line<point>()
    .x(d => d.x)
    .y(d => d.y);

export function drawCurrent(pathData: currentPathData): void {
    if (!pathData.isClosed) { //only draw current on closed circuits
        return;
    }

    //The first two entries cannot be a break due to how the data is structured
    const firstEntry: pathObject = pathData.path[0] as pathObject;
    const secondEntry: pathObject = pathData.path[1] as pathObject;
    const secondEntryPoints : { leftPoint: point, rightPoint: point, actualPoint: point } = getPoints(secondEntry.element);
   
    if (!connectPair([{ belongsTo: firstEntry.element, point: getPoints(firstEntry.element)[firstEntry.point] }, { belongsTo: secondEntry.element, point: secondEntryPoints[secondEntry.point] }], pathData.color)) {
        console.log("CORRUPTED DATA (wires) || INCORRECT PATH DATA");

        clearCurrent();

        return;
    }

    let lastElement: HTMLElement = secondEntry.element;
    let nextPoint: point = secondEntryPoints[determineNextPoint(secondEntry.point)];
    let breakFound: boolean = false;

    for (let i: number = 2; i < pathData.path.length; i++) {
        const val : pathObject | number = pathData.path[i];

        if (!breakFound) {
            if (typeof val === "number") { //a break was found
                const breakEntry: currentPathData[] | undefined = breaks.at(val);

                if (!breakEntry) {
                    console.log("CORRUPTED PATH DATA");

                    clearCurrent(); //this is overkill yet if the data is corrupted the sim will probably produce wrong results

                    return;
                }

                breakEntry.forEach(breakPathData => drawCurrent(breakPathData));

                breakFound = true;

                continue; //moves to the next iteration
            } 

            const elementPoints: { leftPoint: point, rightPoint: point, actualPoint: point } = getPoints(val.element);

            if (!connectPair([{ belongsTo: lastElement, point: nextPoint }, { belongsTo: val.element, point: elementPoints[val.point] }], pathData.color)) {
                console.log("CORRUPTED DATA (wires) || INCORRECT PATH DATA");

                clearCurrent();

                return;                
            }

            lastElement = val.element;
            nextPoint = elementPoints[determineNextPoint(val.point)];            
        } else {
            breakFound = false;

            if (typeof val === "number") {
                console.log("IMPOSSIBLE DATA");

                clearCurrent();

                return;
            }

            lastElement = val.element;
            nextPoint = getPoints(val.element)[val.point];
        }
    }
}

function determineNextPoint(val: "actualPoint" | "leftPoint" | "rightPoint"): "actualPoint" | "leftPoint" | "rightPoint" {
    return val === "actualPoint" ? "actualPoint" : val === "leftPoint" ? "rightPoint" : "leftPoint";
}

function connectPair(pair: pair, color: Readonly<currentColor>): boolean {
    //We first need to examine if there are any bridges between these points
    const intersectionPoints : point[] | undefined = getIntersections(pair[0].belongsTo, pair[1].belongsTo);

    if (!intersectionPoints) {
        console.log("CORRUPTED DATA (wires) || INCORRECT PATH DATA");

        return false;
    }

    const firstPoint: point = pair[0].point;
    const lastPoint: point = pair[1].point;

    let prevPoint: point = pair[0].point;

    for (const intersectionPoint of intersectionPoints) {
        const bridgePoints: { pointA: point, pointB: point } = findBridgePoints(intersectionPoint, firstPoint, lastPoint) as any;

        drawLine(prevPoint, bridgePoints.pointA, color); //connects the two points

        createCurrentBridge(bridgePoints.pointA, bridgePoints.pointB, color); //makes the bridge

        prevPoint = bridgePoints.pointB; //updates the data
    }

    drawLine(prevPoint, lastPoint, color);

    return true;
}

function drawLine(pointA: point, pointB: point, color: Readonly<currentColor>): void {
    currentG.append("path")
        .attr("d", line([pointA, pointB]))
        .attr("stroke", color)
        .classed("current", true);   
}

function getIntersections(elementA: HTMLElement, elementB: HTMLElement) : point[] | undefined {
    return wires.find(object => object.connections.includes(elementA) && object.connections.includes(elementB)).intersectionPoints;
}

function clearCurrent(): void {
    currentG.node()!.textContent = "";
    cBridgeG.node()!.textContent = "";
}

//~~~~~Amperometer Logic~~~~~
const body: HTMLBodyElement = document.body as HTMLBodyElement;

export const amperometers: any = () => allObject.amperometers;

function choosePoint(mainElement: HTMLElement, connectedElement: HTMLElement): "actualPoint" | "leftPoint" | "rightPoint" | undefined {
    if (mainElement.matches(".connection, .amperometer")) {
        return "actualPoint";
    }

    const mainAE: AE | undefined = allElements.get(mainElement);

    if (!mainAE) {
        console.log("CORRUPTED DATA (allElements)");

        return;
    }

    return mainAE.connections.left.has(connectedElement) ? "leftPoint" : "rightPoint";
}

function handleClick(event: MouseEvent): void {
    const amperometerButton: HTMLElement = document.getElementById("amperometer")!;
    
    if (event.target instanceof HTMLElement) {
        if (!amperometerButton.classList.contains("enabled") || !event.target.matches(".wire:not(.bridge)")) {
            return;
        }

        const wire: HTMLElement = event.target;
        
        const wireData: any = wires.find(object => object.element === wire);

        if (!wireData) {
            console.log("CORRUPTED DATA (wires)");

            return;
        }

        //Delete the old wire-group and create a new one
        wires.splice(wires.findIndex(object => object.wireGroup === wireData.wireGroup), wires.filter(object => object.wireGroup === wireData.wireGroup).length);

        const c = d3.pointer(event, allG.node())

        const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreignObject.setAttribute("x", String(c[0] - body.clientHeight * 0.02));
        foreignObject.setAttribute("y", String(c[1] - body.clientHeight * 0.02));
        foreignObject.setAttribute("width", String(body.clientHeight + 16));
        foreignObject.setAttribute("height", String(body.clientHeight + 16));

        const amperometer : HTMLElement = document.createElement("div");
        amperometer.classList.add("amperometer", "userCreated");

        foreignObject.appendChild(amperometer);
        allG.node()!.appendChild(foreignObject);  
        

        const amperometerPoint: point = getCenter(amperometer);
        
        const startPoint = choosePoint(wireData.connections[0], wireData.connections[1]);
        const endPoint = choosePoint(wireData.connections[1], wireData.connections[0]);

        if (!(startPoint && endPoint)) {
            console.log("CORRUPTED DATA (wires)");

            return;
        }

        //Draw the new wires
        drawWirePointToPoint(getPoints(wireData.connections[0])[startPoint], amperometerPoint);
        drawWirePointToPoint(amperometerPoint, getPoints(wireData.connections[1])[endPoint]);

        //Adjust the data of the new wires
        wireData.connections.push(amperometer); //we add the amperometer as the path finding algorithm will treat these wires as distinct 

        wires.forEach(object => {
            if (object.wireGroup === undefined) {
                object.wireGroup = wireData.wireGroup;
                object.connections = wireData.connections;
                object.notConnected = false;
            }
        })

        //we update the allElements data
        allElements.set(amperometer, { element: amperometer, connections: { left: new Set([wireData.connections[0]]), right: new Set([wireData.connections[1]]) } });
        replaceValueInAllElements(wireData.connections[0], wireData.connections[1], amperometer);
        replaceValueInAllElements(wireData.connections[1], wireData.connections[0], amperometer);

        //we update the allObject data
        amperometers().push({ element: amperometer, connectedPath: null, resistance: { value: 0, UM: "(Ω)" } });
    }
}

export function addAmperometer(): void {
    body.addEventListener("click", handleClick);
}

export function removeAmperometer(): void {
    body.removeEventListener("click", handleClick);
}