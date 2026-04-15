import { getRandomInt } from "./commonFunctions.js";

//Types-Interfaces
type currentHue = "yellowish" | "lightBlueish";
export type currentColor = `rgb(${number}, ${number}, ${number})`;
type side = "left" | "right";
type point = "leftPoint" | "rightPoint" | "actualPoint";

interface connectionList {
    left: Set<HTMLElement>;
    right: Set<HTMLElement>;
}

export interface AE {
    element: HTMLElement;
    connections: connectionList;
}

export interface pathObject {
    element: HTMLElement;
    point: point;
}

export interface currentPathData {
    color: currentColor;
    path: (pathObject | number)[];
    isClosed: boolean;
    descendantOf?: currentColor;
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

export const breaks: currentPathData[][] = [];
let breakCounter: number = 0;

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

function addNextElement(pathToAdd: (pathObject | number)[], AEObject: AE, side: side): HTMLElement | undefined {
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
                const valuesToAdd : (number | pathObject)[] | undefined = findBreakPaths(mainPath, currentAEObject.element, currentAEObject.connections[currentSide], startingElement);

                console.warn(valuesToAdd)

                if (!valuesToAdd) {
                    console.log("FATAL ERROR");

                    return;
                }

                const [first, ...rest] = valuesToAdd;

                mainPath.path.push(...rest); //avoid duplicates

                const breakCreated : currentPathData | undefined = breaks.at(valuesToAdd[1] as number)?.at(0); 

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

                let prevVal: pathObject | number = breakCreated.path.at(-2)!;
                let breakEntry: currentPathData[] | undefined = breaks.at(valuesToAdd[1] as number)!;

                if (typeof prevVal === "number") {
                    breakEntry = breaks.at(prevVal);

                    if (!breakEntry) {
                        console.log("RECEIVED CORRUPTED DATA - MAIN")

                        return;
                    }

                    prevVal = breakEntry[0].path.at(-1)!;
                }
                
                if (typeof prevVal === "number") {
                    console.log("FATAL ERROR - MAIN");

                    return;
                }

                let prevElement: HTMLElement = prevVal.element;

                if (prevElement === nextElement) {
                    prevVal = breakEntry[0].path.at(-2)!;

                    if (typeof prevVal === "number") {
                        console.log("THIS ALGORITHM CANNOT GRAPH THIS TOPOLOGY");

                        return;
                    }

                    prevElement = prevVal.element;
                }

                currentSide = nextAE.connections.left.has(prevElement) ? "right" : "left";
            }            
        }

        console.warn(mainPath.path);
        console.warn(breaks);

        return mainPath;
    }

    return;
}

function findBreakPaths(originalPath: currentPathData, splitOrigin: HTMLElement, splitStarts: Set<HTMLElement>, mainOrigin: HTMLElement): (number | pathObject)[] | undefined {
    const splitPaths: Map<currentColor, currentPathData> = new Map();
    const openSplitPaths: Set<currentColor> = new Set();
    const pathMergePointsFound: Map<currentColor, Set<HTMLElement>> = new Map();

    const lastValues: Map<currentColor, HTMLElement> = new Map(); //Reduces the complexity of the program by trading memory efficiency

    for (const splitStart of splitStarts) {
        const splitAE: AE | undefined = allElements.get(splitStart);

        if (!splitAE) {
            console.log("CORRUPTED DATA");

            return;
        }

        const splitPathData: currentPathData = {
            color: findColor(),
            path: [{ point: "actualPoint", element: splitOrigin }, { point: splitAE.element.matches(".connection, .amperometer") ? "actualPoint" : splitAE.connections.left.has(splitOrigin) ? "leftPoint" : "rightPoint", element: splitStart }],
            isClosed: false,
            descendantOf: originalPath.color,
        };

        splitPaths.set(splitPathData.color, splitPathData);
        allPaths.set(splitPathData.color, splitPathData);

        pathMergePointsFound.set(splitPathData.color, new Set());

        lastValues.set(splitPathData.color, splitOrigin);
    }

    while (splitPaths.size > 1 + openSplitPaths.size) {
        for (const splitPath of splitPaths.values()) {
            if (openSplitPaths.has(splitPath.color)) {
                continue;
            }

            let foundAMergePoint = false;

            const mergePointsFound : Set<HTMLElement> | undefined = pathMergePointsFound.get(splitPath.color);

            if (!mergePointsFound) {
                console.log("MISHANDLED DATA");

                //Tag this path as a dead end
                openSplitPaths.add(splitPath.color);
                lastValues.delete(splitPath.color); //free memory

                break; //exit the inner while loop
            }

            while (!foundAMergePoint) {
                const temporaryVal: pathObject | number | undefined = splitPath.path.at(-1);  

                if (!temporaryVal || typeof temporaryVal === "number") {
                    //The algorithm is made in a way so that the last entry can never be a number (i.e. split identifier)
                    console.log("MISHANDLED DATA");

                    //Tag this path as a dead end
                    openSplitPaths.add(splitPath.color);
                    lastValues.delete(splitPath.color); //free memory

                    break; //exit the inner while loop
                }

                const lastAE: AE | undefined = allElements.get(temporaryVal.element);

                if (!lastAE) {
                    console.log("CORRUPTED DATA");

                    //Tag this path as a dead end
                    openSplitPaths.add(splitPath.color);
                    lastValues.delete(splitPath.color); //free memory

                    break; //exit the inner while loop
                }

                const secondToLastElement: HTMLElement | undefined = lastValues.get(splitPath.color);

                if (!secondToLastElement) {
                    console.log("MISHANDLED DATA");

                    //Tag this path as a dead end
                    openSplitPaths.add(splitPath.color);

                    break; //exit the inner while loop
                }

                const sideToCheck: side = lastAE.connections.left.has(secondToLastElement) ? "right" : "left";
                const nextElements: Set<HTMLElement> = lastAE.connections[sideToCheck];

                if (nextElements.size === 0) {
                    //Tag this path as a dead end
                    openSplitPaths.add(splitPath.color);
                    lastValues.delete(splitPath.color); //free memory

                    break; //exit the inner while loop
                } else if (nextElements.size === 1) {
                    //Simply add the element and then check if it is a potential merge point
                    const nextElement: HTMLElement | undefined = addNextElement(splitPath.path, lastAE, sideToCheck)

                    if (!nextElement) {
                        console.log("ERROR (addNextElement)");
                          
                        //Tag this path as a dead end
                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop
                    } else if (nextElement === mainOrigin) {
                        openSplitPaths.add(splitPath.color); //stop looking for new elements

                        continue;
                    }

                    //Adjust the lastValues map
                    lastValues.set(splitPath.color, temporaryVal.element);

                    /*Now we check if the element is a potential merge point
                      This is done by checking if the side we just entered from has 
                      more elements attached to it.
                      This assumes that paths merge on the same side of their common element, 
                      users will be warned about this during the tutorial*/
                    
                    const nextAE: AE | undefined = allElements.get(nextElement);

                    if (!nextAE) {
                        console.log("CORRUPTED DATA");
                          
                        //Tag this path as a dead end
                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop
                    }

                    if (nextAE.connections[nextAE.connections.left.has(temporaryVal.element) ? "left" : "right"].size > 1) {
                        foundAMergePoint = true; //Stops the inner while loop
                        
                        mergePointsFound.add(nextElement);
                    }
                } else {
                    const result: (number | pathObject)[] | undefined = findBreakPaths(splitPath, temporaryVal.element, nextElements, mainOrigin);
                    console.warn(result);
                    if (!result) {
                        console.log("FATAL ERROR");

                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop
                    }
                    console.log("DEBUG", result); 

                    const breakEntry: currentPathData[] | undefined = breaks.at(result[1] as number); //findBreakPaths will always output [originObject, number, mergeObject]
                
                    if (!breakEntry) {
                        console.log("INNER BREAK FAILED");

                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop 
                    }

                    //We need to add the generated data to the path
                    splitPath.path.push(result[1], result[2]) //result[0] is the commonPathObject which was added in the previous iteration

                    /*Now we need to decide whether or not this path should move on
                      This will be done by checking if the mergeElement for the inner break path has
                      room for more paths to merge to it.*/

                    let randomBreakObject: pathObject | number = breakEntry[0].path.at(-2)!;

                    if (typeof randomBreakObject === "number") {
                        const innerBreakEntry: currentPathData[] | undefined = breaks.at(randomBreakObject);

                        if (!innerBreakEntry) {
                            console.log("INNER BREAK FAILED");

                            openSplitPaths.add(splitPath.color);
                            lastValues.delete(splitPath.color); //free memory

                            break; //exit the inner while loop                             
                        }

                        randomBreakObject = innerBreakEntry[0].path.at(-1)!;
                    }

                    if (typeof randomBreakObject === "number") {
                        console.log("FATAL ERROR - LOGIC FAILURE");

                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop 
                    }

                    const randomBreakElement: HTMLElement = randomBreakObject.element;
                    console.log(randomBreakElement)
                    
                    //randomBreakElement should also act as the new entry for lastValues
                    lastValues.set(splitPath.color, randomBreakElement);

                    const mergeObject: pathObject = result[2] as pathObject;
                    const mergeElement: HTMLElement = mergeObject.element;
                    const mergeAE: AE | undefined = allElements.get(mergeElement);

                    if (!mergeAE) {
                        console.log("CORRUPTED DATA");

                        openSplitPaths.add(splitPath.color);
                        lastValues.delete(splitPath.color); //free memory

                        break; //exit the inner while loop                         
                    }

                    const pathsConnected: number = mergeAE.connections[mergeAE.connections.left.has(randomBreakElement) ? "left" : "right"].size;

                    if (pathsConnected > breakEntry.length) { //this means that there is room for more paths, hence the path should stop here
                        mergePointsFound.add(mergeElement);

                        foundAMergePoint = true;

                        break;
                    }
                }
            }
        }

        //After all paths have got a chance to find a merge point we check if two or more have met
        //starts from the first merge points found in order to not miss anything, does this until no more merges can happen
        let stopLooking: boolean = false;

        while (!stopLooking) {
            stopLooking = false;

            for (const [pathColor, mergePointsFound] of pathMergePointsFound.entries()) {
                for (const mergePoint of mergePointsFound) {
                    const pathsToMerge: Set<currentColor> = new Set([pathColor]);
                    
                    for (const [otherColor, otherMergePointsFound] of pathMergePointsFound.entries()) {
                        if (otherMergePointsFound.has(mergePoint)) {
                            pathsToMerge.add(otherColor);

                            continue; 
                        }
                    }

                    if (pathsToMerge.size > 1) {
                        stopLooking = true; //resets the nested loops

                        //initiate a merge
                        const mergeResult: currentPathData | undefined = merge({ pathsToMerge, mergePointsFound: pathMergePointsFound }, { commonElement: splitOrigin, mergeElement: mergePoint }, originalPath.color);
                        
                        if (!mergeResult) {
                            console.log("FATAL MERGE ERROR");

                            return;
                        }
                        
                        for (const mergedColor of pathsToMerge) {
                            openSplitPaths.delete(mergedColor);
                            lastValues.delete(mergedColor);
                            splitPaths.delete(mergedColor);

                            //pathMergePointsFound was handled during merge
                        }

                        //we need to create an entries for the new path for everything except pathMergePointsFound
                        splitPaths.set(mergeResult.color, mergeResult);

                        const breakEntry: currentPathData[] | undefined = breaks.at(mergeResult.path[1] as number);

                        if (!breakEntry) {
                            console.log("MISHANDLED DATA (merge)");

                            openSplitPaths.add(mergeResult.color);

                            break;
                        }

                        const randomBreakObject: pathObject = breakEntry[0].path.at(-1)! as pathObject;
                        const randomBreakElement: HTMLElement = randomBreakObject.element;

                        lastValues.set(mergeResult.color, randomBreakElement);

                        break; //reset the nested loops
                    }
                }

                if (stopLooking) {
                    break;
                }
            }   

            stopLooking = !stopLooking; //if a merge happened then we should look for more merges, otherwise stop
        }
    }

    //We need to return the only non-open path
    for (const splitPath of splitPaths.values()) {
        if (!openSplitPaths.has(splitPath.color)) {
            return splitPath.path;
        }
    }

    console.log("ALL PATHS WERE OPEN");

    return; 
}

function merge(
    pathData: { pathsToMerge: Set<currentColor>, mergePointsFound: Map<currentColor, Set<HTMLElement>> },
    points: { commonElement: HTMLElement, mergeElement: HTMLElement },
    ancestor: currentColor
): currentPathData | undefined {
    /*We first need to determine which list of mergePoints we will keep.
      This will be done by simply choosing the one that goes further.*/
    
    let listToKeep: Set<HTMLElement> | undefined;
    
    //Register a new entry on the breaks array
    const newBreak: currentPathData[] = [];

    const isFullMerge: boolean = pathData.pathsToMerge.size === pathData.mergePointsFound.size;
    const newColor: currentColor = isFullMerge ? ancestor : findColor();


    for (const mergeColor of pathData.pathsToMerge) {
        const specificMergePoints: Set<HTMLElement> | undefined = pathData.mergePointsFound.get(mergeColor);

        if (!specificMergePoints) {
            console.log("RECEIVED CORRUPTED DATA (pathMergePointsFound)");

            pathData.mergePointsFound.delete(mergeColor);
            continue; // we try to finish the rest of the paths
        }

        //Delete all previous points found
        for (const mergePoint of specificMergePoints) {
            if (mergePoint !== points.mergeElement) {
                specificMergePoints.delete(mergePoint);
            } else {
                break;
            }
        }

        if (!listToKeep || specificMergePoints.size > listToKeep.size) {
            listToKeep = specificMergePoints;
        }

        //We now delete the old data 
        pathData.mergePointsFound.delete(mergeColor);

        //We also need to update the isClosed variable for the merge paths and register the path to the break entry
        const pathToMerge : currentPathData | undefined = allPaths.get(mergeColor);

        if (!pathToMerge) {
            console.log("MISHANDLED DATA (allPaths), FATAL");

            return;
        }

        newBreak.push(pathToMerge);
        pathToMerge.isClosed = true;
        pathToMerge.descendantOf = newColor; //covers both cases
    }

    breaks.push(newBreak); //we add the entry to the breaks data array

    const mergePathData: currentPathData = {
        isClosed: false,
        path: [{ element: points.commonElement, point: "actualPoint" }, breakCounter++, { element: points.mergeElement, point: "actualPoint" }],
        color: newColor,
        descendantOf: ancestor
    }

    if (!isFullMerge) {
        allPaths.set(mergePathData.color, mergePathData);
    }

    pathData.mergePointsFound.set(mergePathData.color, listToKeep!);

    return mergePathData;
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
        } while (pathColors.has(color))
    }

    pathColors.add(color);

    return color
}

export function changeAllElements(newAllElements: Map<HTMLElement, AE>): void {
    allElements = newAllElements;
}