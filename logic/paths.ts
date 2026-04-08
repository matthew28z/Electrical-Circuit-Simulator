import { start } from "node:repl";
import { getRandomInt } from "./commonFunctions.js";
import path from "node:path";

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
    parallelTo?: Set<currentColor | string>;
}

const scenario : currentHue = getRandomInt(1, 2) === 1 ? "yellowish" : "lightBlueish";

export const pathColors: Set<currentColor> = new Set();

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

function addNextElement(pathToAdd: pathObject[], AEObject: AE, side: side): HTMLElement | undefined {
    if (AEObject.connections[side].size > 1) {
        return;
    }

    const elementToAdd : HTMLElement | undefined = AEObject.connections[side].values().next().value;

    if (!elementToAdd) {
        return;
    }

    const AEToAdd: AE | undefined = allElements.get(elementToAdd);
    
    if (!AEToAdd) {
        return;
    }

    pathToAdd.push({
        element: elementToAdd,
        point: AEToAdd.element.matches(".connection, .amperometer") ? "actualPoint" :  AEToAdd.connections.left.has(AEObject.element) ? "leftPoint" : "rightPoint"
    });

    return elementToAdd;
}

export function findMainPath(voltageSources: any): currentPathData | undefined {
    const startingElement : HTMLElement | undefined = findPathStart(voltageSources);
    
    if (startingElement) {       
        const mainPath: currentPathData = {
            color: findColor(),
            path: [{ point: "leftPoint", element: startingElement }],
            isClosed: false,
        };

        const firstAEObject: AE | undefined = allElements.get(startingElement);
        const firstSide: side = "left";

        if (!firstAEObject) {
            console.log("FATAL ERROR");

            return;
        }

        let currentAEObject: AE = firstAEObject;
        let currentSide : side = firstSide;

        while (!mainPath.isClosed) {
            const elementsFound = currentAEObject.connections[currentSide].size;

            if (elementsFound === 0) {
                console.log("NO PATH FOUND");

                return;
            } else if (elementsFound === 1) {
                const valueAdded: HTMLElement | undefined = addNextElement(mainPath.path, currentAEObject, currentSide) 

                if (!valueAdded) {
                    console.log("CORRUPTED DATA");

                    return;
                }

                const oldElement: HTMLElement = currentAEObject.element;

                if (valueAdded === startingElement) {
                    mainPath.isClosed = true;

                    break;
                }

                const nextAE: AE | undefined = allElements.get(valueAdded);
                
                if (!nextAE) {
                    console.log("FATAL ERROR");

                    return;
                }

                currentAEObject = nextAE;

                currentSide = currentAEObject.connections.left.has(oldElement) ? "right" : "left";
            } else {
                
            }            
        }





        return mainPath;
    }

    return;
}

function findBreakPaths(originalPathData: currentPathData, elementsFound: Set<HTMLElement>) {
    const connectionsFound: Set<HTMLElement>[] = [];
    const newPaths: currentPathData[] = [];
    elementsFound.forEach(element => {
        connectionsFound.push(new Set<HTMLElement>);
        newPaths.push({
            color: findColor(),
            path: [],
            isClosed: false,
            descendantOf: originalPathData.color
        })
    });

    let pathsHaveMerged: boolean = false;

    while (!pathsHaveMerged) {
        newPaths.forEach(pathData => {
            
        })
    }
}

function findColor() : currentColor {
    let red : number;
    let green : number;
    let blue : number;

    let color: currentColor;

    if (scenario === "yellowish") {
        do {
            red   = getRandomInt(230, 255); 
            green = getRandomInt(220, 250);  
            blue  = getRandomInt(150, 210);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (!pathColors.add(color))  
    } else {
        do {
            red   = getRandomInt(200, 245);  
            green = getRandomInt(210, 255);  
            blue  = getRandomInt(180, 240);  


            color = `rgb(${red}, ${green}, ${blue})`
        } while (!pathColors.add(color))
    }

    return color
}

export function changeAllElements(newAllElements: Map<HTMLElement, AE>): void {
    allElements = newAllElements;
}