import { should } from "vitest";
import { getRandomInt } from "./commonFunctions.js";
import { start } from "node:repl";

//Types-Interfaces
type currentHue = "yellowish" | "lightBlueish";
export type currentColor = `rgb(${number}, ${number}, ${number})`;
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
    element: HTMLElement;
    point: point;
}

export interface currentPathData {
    color: currentColor;
    path: (pathObject | breakIdentifier)[];
    isClosed: boolean;
    descendantOf?: currentColor;
    parallelTo?: Set<currentColor>;
    splitsTo?: Set<currentColor>;

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

export const allPaths: Map<currentColor, currentPathData> = new Map();

function findPathStart(voltageSources: any): HTMLElement | undefined {
    console.log(allElements)
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

function addNextElement(pathToAdd: (pathObject | breakIdentifier)[], AEObject: AE, side: side): HTMLElement | undefined {
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

        allPaths.set(mainPath.color, mainPath);

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
                const valuesToAdd : (breakIdentifier | pathObject)[] | undefined = findBreakPaths(mainPath, currentAEObject.connections[currentSide], currentAEObject.element, startingElement);

                if (!valuesToAdd) {
                    console.log("FATAL ERROR");

                    return;
                }

                const [first, ...rest] = valuesToAdd;

                mainPath.path.push(...rest); //avoid duplicates

                const breakCreated : currentPathData | undefined = breaks.get(valuesToAdd[1] as breakIdentifier)?.at(0); //the function above will always return a pathObject containing just a breakIdentifier

                if (!breakCreated) {
                    console.log("FATAL ERROR");

                    return;
                }

                const pathObj : pathObject = valuesToAdd.at(-1)! as pathObject;

                const nextElement: HTMLElement  = pathObj.element; 

                const nextAE: AE | undefined = allElements.get(nextElement);
                
                if (!nextAE) {
                    console.log("FATAL ERROR");

                    return;
                }

                currentAEObject = nextAE;

                const prevVal: pathObject | breakIdentifier | undefined = breakCreated.path.at(-2); //the second to last element of a break path can never be another break

                if (!prevVal || typeof prevVal === "string") {
                    console.log("FATAL ERROR");

                    return;
                }

                const prevElement: HTMLElement = prevVal.element;

                currentSide = nextAE.connections.left.has(prevElement) ? "right" : "left";
            }            
        }

        return mainPath;
    }

    return;
}

export const breaks: Map<breakIdentifier, currentPathData[]> = new Map();
let breakCounter: number = 0;

function findBreakPaths(
    originalPathData: currentPathData,
    elementsFound: Set<HTMLElement>,
    originElement: HTMLElement,
    startingElement: HTMLElement
): (pathObject | breakIdentifier)[] | undefined {
    let connectionsFound: Set<HTMLElement>[] = [];
    let newPaths: currentPathData[] = [];
    let indexesFinished: Set<number> = new Set();

    let shouldSkip: boolean = false;

    elementsFound.forEach(element => {
        connectionsFound.push(new Set<HTMLElement>);

        const AEToAdd : AE | undefined = allElements.get(element);

        if (!AEToAdd) {
            console.log("FATAL ERROR");

            return;
        }

        newPaths.push({
            color: findColor(),
            path: [{ element: originElement, point: "actualPoint" }, { element: element, point: element.matches(".connection, .amperometer") ? "actualPoint" :  AEToAdd.connections.left.has(originElement) ? "leftPoint" : "rightPoint" }],
            isClosed: false,
            descendantOf: originalPathData.color
        })

        const newPath: currentPathData = newPaths.at(-1)!;
        
        allPaths.set(newPath.color, newPath);
    });

    let count = 100; //for debugging

    while (newPaths.length > 1 && indexesFinished.size < newPaths.length && count-- > 0) {
        for (let i: number = newPaths.length - 1; i >= 0; i--) {
            if (indexesFinished.has(i)) {
                continue;
            } else if (shouldSkip) { //allows the newly created mergedpath to move one step forward and catch up
                if (i !== newPaths.length - 1) {
                    if (i === 0) {
                        shouldSkip = false;
                    }

                    continue;                
                } 
            }

            let breakFromLoop: boolean = false;

            let shouldStop: boolean = false;

            while (!shouldStop) {
                const val : pathObject | breakIdentifier | undefined = newPaths[i].path.at(-1);
                
                if (typeof val !== "string" && val) { //a path can never end on a break
                    const key: HTMLElement = val.element;

                    const AEObject: AE | undefined = allElements.get(key);

                    if (!AEObject) {
                        console.log("CORRUPTED DATA");

                        return;
                    }

                    const prevValue: pathObject | breakIdentifier | undefined = newPaths[i].path.at(-2);
                    let prevElement: HTMLElement | undefined;

                    if (typeof prevValue === "string") {
                        let breakPath: currentPathData | undefined = breaks.get(prevValue)?.at(0);

                        if (!breakPath) {
                            console.log("CORRUPTED DATA");

                            return;
                        }

                        let lastObj: pathObject | breakIdentifier = breakPath.path.at(-2)!;

                        while (typeof lastObj === "string") { 
                            const obj : pathObject | breakIdentifier | undefined = breaks.get(lastObj)?.at(0)?.path.at(-2);

                            if (!obj) {
                                console.log("CORRUPTED DATA");

                                return;
                            }

                            lastObj = obj;
                        }


                        prevElement = lastObj.element;

                        if (!prevElement) {
                            console.log("CORRUPTED DATA");

                            return; 
                        }
                    } else {
                        prevElement = prevValue?.element ?? originElement;
                    }

                    const nextSide: side = AEObject.connections.left.has(prevElement) ? "right" : "left";

                    const elementsFoundRef: Set<HTMLElement> = AEObject.connections[nextSide];

                    if (elementsFoundRef.size === 0) {
                        console.log("NO PATH FOUND")

                        //Remove paths that lead to a dead end
                        indexesFinished.delete(i);
                        newPaths.splice(i, 1);
                        connectionsFound.splice(i, 1);

                        break;
                    } else if (elementsFoundRef.size === 1) {
                        const nextElement: HTMLElement | undefined = addNextElement(newPaths[i].path, AEObject, nextSide);

                        if (!nextElement) {
                            console.log("FATAL ERROR");

                            return;
                        }

                        const nextAE: AE | undefined = allElements.get(nextElement);

                        if (!nextAE) {
                            console.log("CORRUPTED DATA");

                            return;
                        }

                        //No need to check if it is a connnection as only connections abide this check
                        if (nextAE.connections[nextAE.connections.left.has(AEObject.element) ? "left" : "right"].size > 1) {
                            shouldStop = true;
                            connectionsFound[i].add(nextElement);

                            if (i !== 0) {
                                continue;
                            }

                            const indexesToMerge: Set<number> = new Set();

                            for (let j: number = 0; j < connectionsFound.length; j++) {
                                if (breakFromLoop) {
                                    break;
                                }

                                for (const potentialMergeElement of connectionsFound[j]) {
                                    for (let k: number = 0; k < connectionsFound.length; k++) {
                                        if (connectionsFound[k].has(potentialMergeElement)) {
                                            indexesToMerge.add(k);
                                        }
                                    }
                                

                                    if (indexesToMerge.size > 1) {
                                        const mergeResult: { connectionsFound: Set<HTMLElement>[], newPaths: currentPathData[], indexesFinished: Set<number> } | undefined = mergeBreakPaths(indexesToMerge, newPaths, connectionsFound, indexesFinished, nextElement, originElement);
                                    
                                        if (!mergeResult) {
                                            console.log("FATAL ERROR");

                                            return;
                                        }

                                        connectionsFound = mergeResult.connectionsFound;
                                        newPaths = mergeResult.newPaths;
                                        indexesFinished = mergeResult.indexesFinished;

                                        shouldSkip = true;

                                        breakFromLoop = true;
                                        break; //stop searching for new merges
                                    } else {
                                        indexesToMerge.clear();
                                    }
                                }    
                            }

                            break; //exits the while loop
                        } else if (nextElement === startingElement) {
                            indexesFinished.add(i);
                        }
                    } else {
                        const valuesToAdd : (breakIdentifier | pathObject)[] | undefined = findBreakPaths(newPaths[i], elementsFoundRef, AEObject.element, startingElement);

                        if (!valuesToAdd) {
                            console.log("FATAL ERROR");

                            return;
                        }

                        const [first, ...rest] = valuesToAdd;

                        newPaths[i].path.push(...rest); //avoid duplicates 

                        const commonConnectionObj : pathObject = valuesToAdd.at(-1)! as pathObject;

                        connectionsFound[i].add(commonConnectionObj.element)
                    }
                }
            }

            if (breakFromLoop) { 
                break; //re evalautes the outer for loop if a merge occured
            }
        }
    }

    return newPaths[0].path;
}

function mergeBreakPaths(
    indexesToMerge: Set<number>,
    breakPaths: currentPathData[],
    connectionsFound: Set<HTMLElement>[],
    indexesFinished: Set<number>,
    commonElement: HTMLElement,
    originElement: HTMLElement
): {
    connectionsFound: Set<HTMLElement>[],
    newPaths: currentPathData[],
    indexesFinished: Set<number>
} | undefined {
    console.log(breakPaths)
    const firstIndex: number | undefined = indexesToMerge.values().next().value;

    if (firstIndex === undefined) {
        console.log("FATAL ERROR");

        return;
    }

    const originalAncestor = breakPaths[firstIndex].descendantOf!;

    const isLastMerge : boolean = indexesToMerge.size === breakPaths.length;
    
    const newColor: currentColor = isLastMerge ? originalAncestor : findColor(); //here originalAncestor will be the path that initially split

    const pathsMerged : Set<currentColor> = new Set();

    indexesToMerge.forEach(index => {
        const breakPath: currentPathData = breakPaths[index];
        
        if (isLastMerge) {
            breakPath.isClosed = true;

            if (breakPath.splitsTo !== undefined) {
                for (const currentColor of breakPath.splitsTo) {
                    const pathData: currentPathData | undefined = allPaths.get(currentColor);

                    if (!pathData) {
                        console.log("FATAL ERROR");

                        return;
                    }

                    pathData.isClosed = true;
                }
            }
        }

        pathsMerged.add(breakPath.color);

        let tracker: boolean = false;

        breakPath.path.forEach((val, index) => {
            if (tracker) {
                return;
            }

            if (typeof val !== "string" && val.element === commonElement) {
                breakPath.path.splice(index + 1);
                tracker = true;
            }
        })

        if (breakPath.parallelTo === undefined) {
            breakPath.parallelTo = new Set();
        } 

        breakPath.descendantOf = newColor;

        indexesToMerge.forEach(otherIndex => {
            if (otherIndex !== index) {
                breakPath.parallelTo?.add(breakPaths[otherIndex].color);
            }
        })
    })

    const breakIdentifier : breakIdentifier = `break-${breakCounter++}`;

    breaks.set(breakIdentifier, breakPaths.filter(pathData => pathData.descendantOf === newColor));

    const mergedPath: currentPathData = {
        color: newColor,
        path: [{ element: originElement, point: "actualPoint" }, breakIdentifier, { element: commonElement, point: "actualPoint" }],
        isClosed: false,
        descendantOf: originalAncestor,
        splitsTo: pathsMerged
    }

    if (!isLastMerge) {
        allPaths.set(mergedPath.color, mergedPath);
    }

    return {
        connectionsFound: [...connectionsFound.filter((set, index) => !indexesToMerge.has(index)), new Set()],
        newPaths: [...breakPaths.filter(pathData => pathData.descendantOf !== newColor), mergedPath],
        indexesFinished: new Set(Array.from(indexesFinished).filter(index => !indexesToMerge.has(index)))
    };
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