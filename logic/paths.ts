import { start } from "node:repl";
import { getRandomInt } from "./commonFunctions.js";

//Types-Interfaces
type currentHue = "yellowish" | "lightBlueish";
type currentColor = `rgb(${number}, ${number}, ${number})`;
type side = "left" | "right";
type point = "leftPoint" | "rightPoint" | "actualPoint";
type breakIdentifier = `break-${number}`;

interface connectionList {
    left: Set<HTMLElement>;
    right: Set<HTMLElement>;
}

interface AE {
    element: HTMLElement;
    connections: connectionList;
}

interface pathObject {
    element: HTMLElement | breakIdentifier;
    point?: point;
}

interface currentPathData {
    color: currentColor;
    path: pathObject[];
    isClosed: boolean;
    descendantOf?: currentColor;
}

const scenario : currentHue = getRandomInt(1, 2) === 1 ? "yellowish" : "lightBlueish";

export const pathColors: currentColor[] = [];

export let allElements : Map<HTMLElement, AE>= new Map();

export function updateAllElements(
    element: HTMLElement,
    connectedElement: HTMLElement | null = null,
    side: side | null = null
) : void {
    const objectToUpdate : AE | undefined = allElements.get(element);

    if (!objectToUpdate) { //is a new element
        if (connectedElement) {
            if (side === "left") {
                allElements.set(element, { element: element, connections: { left: new Set([connectedElement]), right: new Set() } });
            } else {
                allElements.set(element, { element: element, connections: { left: new Set(), right: new Set([connectedElement]) } });
            };
        } else {
            allElements.set(element, { element: element, connections: { left: new Set(), right: new Set() } });
        }
    } else if (side && connectedElement) { 
        //For an element to not be new this means that there is a connectedElement and a side specified
        objectToUpdate.connections[side].add(connectedElement); //avoids duplicates since it is a set
    }    
}

export const breaks: currentPathData[] = [];

function findPathStart(voltageSources : any) : HTMLElement | undefined {
    let startingElement : HTMLElement | undefined;
    
    for (const object of voltageSources) {
        const voltageSource : HTMLElement = object.element;
        
        const AEObject : AE | undefined = allElements.get(voltageSource);

        if (AEObject && AEObject.connections.left.size !== 0 && AEObject.connections.right.size !== 0) {
            startingElement = voltageSource;
            break;
        }
    }

    return startingElement;
}

function traversePath(startingElement : HTMLElement, side : side, pathData : currentPathData) : void {
    let nextAEObject: AE | undefined = allElements.get(startingElement);

    if (!nextAEObject) {
        console.log("FATAL ERROR (CORRUPTED DATA)");

        return;
    }

    const pathToTraverse: pathObject[] = pathData.path;

    while (!pathData.isClosed) {
        const AEObject: AE = nextAEObject;
        const currentElement: HTMLElement = AEObject.element;

        const nextSide : side = side === "left" ? "right" : "left";
        
        if (AEObject.connections[nextSide].size === 0) {
            console.log("NO PATH FOUND");

            return;
        } else if (AEObject.connections[nextSide].size === 1) {
            const nextElement : HTMLElement | undefined = AEObject.connections[nextSide].values().next().value;
            
            if (!nextElement) {
                console.log("FATAL ERROR (CORRUPTED DATA)")
                return;
            } 

            const nextPoint : point = nextSide === "left" ? "leftPoint" : "rightPoint";

            pathToTraverse.push({ element: nextElement, point: nextPoint });

            nextAEObject = allElements.get(nextElement);

            if (!nextAEObject) {
                console.log("FATAL ERROR (CORRUPTED DATA)");

                return;
            }
            
            side = nextAEObject.connections.left.has(currentElement) ? "left" : "right";
        } else {
            pathToTraverse.push({ element: `break-${breaks.length}` });

            const breakPath: currentPathData | undefined = findBreakPath(currentElement, side, pathData.color);

            if (breakPath) {
                breaks.push(breakPath); //the first break found will be the last one pushed
            }
        }

        if (currentElement === startingElement) { //checks only after currentElement has been reassigned
            pathData.isClosed = true;
        }
    }
}

export function findMainPath(voltageSources : any) : currentPathData | undefined {
    const startingElement : HTMLElement | undefined = findPathStart(voltageSources);
    
    if (startingElement) {       
        const mainPath: currentPathData = {
            color: findColor(),
            path: [{ point: "leftPoint", element: startingElement }],
            isClosed: false,
        };

        traversePath(startingElement, "left", mainPath);

        console.log(mainPath);
        return mainPath;
    }

    return;
}

//Not finished
function findBreakPath(startingConnection : HTMLElement, startingSide : side, originalPath : currentColor) : currentPathData | undefined {
    let currentElement : HTMLElement = startingConnection;
    let side : side = startingSide;

    const startingObject : AE | undefined = allElements.get(currentElement);

    if (startingObject) {
        const connectionSets: Set<HTMLElement>[] = [];
        
        startingObject.connections[side].forEach(breakStart => {
            const currentSet : Set<HTMLElement> = new Set();

            const currentBreakData : currentPathData = {
                color: findColor(),
                path: [],
                isClosed: false,
                descendantOf: originalPath
            };

            const breakAE: AE | undefined = allElements.get(breakStart);
            
            if (!breakAE) {
                console.log("FATAL ERROR (CORRUPTED DATA)");
                
                return;
            }

            traversePath(breakStart, breakAE.connections.left.has(startingConnection) ? "left" : "right", currentBreakData);

            currentBreakData.path.forEach(object => {
                if (typeof object.element !== "string" && object.element.classList.contains("connection")) {
                    currentSet.add(object.element);
                }
            })
        }) 
    }

    return;
}

function findColor() : currentColor {
    let red : number;
    let green : number;
    let blue : number;

    let color : currentColor;
    if (scenario === "yellowish") {
        do {
            red   = getRandomInt(230, 255); 
            green = getRandomInt(220, 250);  
            blue  = getRandomInt(150, 210);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (pathColors.includes(color))  
    } else {
        do {
            red   = getRandomInt(200, 245);  
            green = getRandomInt(210, 255);  
            blue  = getRandomInt(180, 240);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (pathColors.includes(color))
    }

    pathColors.push(color)

    return color
}

export function changeAllElements(newAllElements: Map<HTMLElement, AE>): void {
    allElements = newAllElements;
}