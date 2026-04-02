import { getRandomInt } from "./commonFunctions.js";
import { amperometers } from "./current.js";

const scenario = getRandomInt(1, 2) === 1 ? "yellowish" : "lightBlueish"

export const pathColors = [];/*["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue",
"BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson",
"Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen",
"DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise",
"DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia",
"Gainsboro", "GhostWhite", "Gold", "GoldenRod"];*/

export let allElements = new Map(); //is meant to have this form: [{element: any element, connections: {left: an array, right: an array}}] with the key being the element itself

export function updateAllElements(element, connectedElement = null, side = null) {
    const objectToUpdate = allElements.get(element);

    if (!objectToUpdate) { //is a new element
        if (connectedElement) {
            if (side === "left") {
                allElements.set(element, { element: element, connections: { left: new Set(connectedElement), right: new Set() } });
            } else {
                allElements.set(element, { element: element, connections: { left: new Set(), right: new Set(connectedElement) } });
            };
        } else {
            allElements.set(element, { element: element, connections: { left: new Set(), right: new Set() } });
        }
    } else {
        //For an element to not be new this means that there is a connectedElement and a side specified
        objectToUpdate.connections[side].add(connectedElement); //avoids duplicates since it is a set
    }
}

let breakCounter = 0;
export const breaks = [];
let numberOfPaths = 1;


export function findAllPaths(voltageSources, flow = "conventional") {
    console.log(allElements)
    let start;
    let isClosedLoop = false //a quick check that is not guaranteed
    let index = 0;
    let startIndex;

    let side = "left"

    do {
        if (index < voltageSources.length) {
            start = voltageSources[index].element
            
            const startObject = allElements.get(start);
            const left = startObject.connections.left.size !== 0;
            const right = startObject.connections.right.size !== 0;

            if (right && left) {
                isClosedLoop = true;
                startIndex = elementIndex;
                numberOfPaths = 1;
            } else {
                index++;
            }
        } else {
            alert("NO PATHS FOUND");
            break;
        }
    } while (!isClosedLoop);

    let loopHasClosed = false;
    //let currentElement = allElements[startIndex].connections.left[0] //since start is not a connection it will only have one element connected to its left point
    let loopIndex = startIndex;

    const mainPath = {color: findColor(), path: [{element: start, point: "leftPoint"}], isClosed: false};

    /*console.log(start)
    console.log(loopIndex)
    console.log(mainPath)
    console.log(side)*/
    closeLoop(start, mainPath, side)

    return mainPath;
}

let shouldBreak = false;

function handleBreak(connectedElements, pathObject, startingElement) {
    console.log("reached")
    let end;
    pathObject.path.push(`break-${breakCounter}`)
    const currentCounter = breakCounter
    breakCounter++
    let amountOfNewPaths = 0
    const newPaths = [];

    const nextConnections = [];
    
    const connectionPathArray = [];

    //Creates a new path for each connected element and immediatly tries to find its ending
    for (let element of connectedElements.values()) {
        let object = { color: findColor(), path: [{ element: startingElement, point: "actualPoint" }], isClosed: null, descendantOf: pathObject.color };
        numberOfPaths++;

        const elementObject = allElements.get(element);
        const side = elementObject.connections.left.has(startingElement) ? "right" : "left"; 

        let point;

        if (element.classList.contains("connection")) {
            point = "actualPoint";
        } else {
            point = side === "left" ? "rightPoint" : "leftPoint";
        }

        object.path.push({ element: element, point: point });

        const values = findNextConnection(element, object, side);
        const nextConnection = values.element;
        const nextSide = values.nextSideToCheck;
        object = values.pathObject;

        nextConnections.push({ element: nextConnection, nextSideToCheck: nextSide });

        newPaths.push(object);
        amountOfNewPaths++;

        connectionPathArray.push([{element: nextConnection, nextSideToCheck: nextSide}])
    }

    let foundTheEnd = false;

    const indexTracker = new Set();
    const unfinishedIndexes = new Set();

    while (!foundTheEnd) {
        console.log(end)
        console.log("reached2")
        //Tries to assign end a value if it does not have one already by checking whether two paths already end in the same connection
        if (!end) {
            const comparisonSet = new Set();

            for (let i = 0; i < amountOfNewPaths; i++) {
                const connection = nextConnections[i].element
        
                unfinishedIndexes.add(i)

                if (comparisonSet.has(connection) && connection) {
                    end = connection

                    newPaths[i].isClosed = true
                    indexTracker.add(i)
                } else if (newPaths[i].isClosed === false) {
                    indexTracker.add(i)
                } else {
                    comparisonSet.add(connection)
                }
            }

            if (end) {
                console.log(end, breakCounter)
                //Finds the first path that had found the end since it was not taken into account
                for (let i = 0; i < nextConnections.length; i++) {
                    const element = nextConnections[i].element

                    if (end === element) {
                        indexTracker.add(i)
                        newPaths[i].isClosed = true

                        break
                    }
                }
            } else { //does a secondary deeper search for some edge cases where the number of connections in each break path do not align
                /*This approach leaves the chance for handleBreak to be called many uneccary times. Despite this due to the
                  simulation's purpose being the ability to solve one user created circuit at a time, this is a semi-calculated
                  risk, that mostly bets on user's not creating extreme circuitry that leads to an endless loop(i.e. too many splits 
                  that require deepSearches which themselves trigger another split that requires a deepSearch before finishing etc). 
                  Although I see a possibility for this logic to fail, the complexity of the problem requires either extreme meta data, 
                  a quite bigger tutorial and a system in general that is even more mistake friendly if the user is not well accustomed to it
                  or a whole rethink of the current structure, and to all the above at least for now I say no.*/
                const values = checkFoundConnections(connectionPathArray);

                let result = values.result;

                if (result) {
                    end = values.end; //assigns end the intended value

                    updateBreakArrays(nextConnections, connectionPathArray, end, newPaths).forEach(index => {
                        unfinishedIndexes.delete(index);
                    })
                }
            }

            //removes the finished paths
            indexTracker.forEach(index => {
                unfinishedIndexes.delete(index);
            })
        } else { 
            unfinishedIndexes.forEach(index => {
                console.log("k")
                const connection = nextConnections[index].element;

                //checks if the path found the end in the previous iteration or if the path is open
                if (connection === end || newPaths[index].isClosed === false) {
                    unfinishedIndexes.delete(index);
                }
            })
        }

        //progresses the unfinished paths
        unfinishedIndexes.forEach(index => {
            console.log(nextConnections)
            const element = nextConnections[index].element;
            const side = nextConnections[index].nextSideToCheck;

            //updates the array responsible for the shallow search (stores most recent connections)
            const values = findNextConnection(element, newPaths[index], side)
            if (values.element !== startingElement) {// prevents infinite loops
                //updates the shallow-search loop
                nextConnections[index] = {element: values.element, nextSideToCheck: values.nextSideToCheck}
            
                //updates the array responsible for the deep search (stores all connections)
                connectionPathArray[index].push({element: values.element, nextSideToCheck: values.nextSideToCheck})
            } else {
                //
            }
        })

        foundTheEnd = nextConnections.every((object, index) => {
            const currentPath = newPaths[index]
            console.log(object.element === end)
            console.log(currentPath.isClosed)
        
            return (object.element === end || currentPath.isClosed === false)
        })
    }
    
    breaks[currentCounter] = newPaths;

    const nextSideToCheck = nextConnections.find(object => object.element === end).nextSideToCheck

    console.log({ element: end, nextSideToCheck: nextSideToCheck });
    return { element: end, nextSideToCheck: nextSideToCheck };
}

function closeLoop(start, pathObject, side = "left") {
    let loopHasClosed = false;
    let currentElement = start;
    let iteration = 0;
    let point = "leftPoint"; //closeLoop always starts from the left

    while (!loopHasClosed) {
        //console.log(allElements[loopIndex])
        const connectedElements = allElements.get(currentElement).connections[side];
        //console.log(connectedElements)

        if (iteration <= allElements.length + 3) {
            if (connectedElements.size === 1) {
                const connectedElement = connectedElements.values().next().value();

                //checks which side should be the next to be checked
                side = allElements.get(connectedElement).connections.left.has(currentElement) ? "right" : "left";
                
                if (connectedElement.classList.contains("connection")) {
                    point = "actualPoint";
                } else if (connectedElement.classList.contains("amperometer")) {
                    point = "actualPoint";

                    const obj = amperometers().find(object => object.element === connectedElement);

                    obj.connectedPath = pathObject.color;
                } else {
                    point = side === "left" ? "rightPoint" : "leftPoint";
                }
                //adjusts the element
                currentElement = connectedElement;
                
                /*This checks if the path reached back to the original voltage source and if so, 
                  it adjusts point to the free space of the original starting point*/
                if (start === connectedElement) {
                    loopHasClosed = true;
                    pathObject.isClosed = true;
                    point = "rightPoint";
                }
                  
                pathObject.path.push({ element: connectedElement, point: point });
            } else if (connectedElements.size === 0) {
                alert("NO PATHS FOUND");
                break;
            } else {
                //console.warn("infinite loop")
                //break //temporary
                const values = handleBreak(connectedElements, pathObject, currentElement);
                currentElement = values.element;
                loopIndex = values.loopIndex;
                side = values.nextSideToCheck;

                //handleBreak always returns a connection and connections only have one point
                const point = "actualPoint";

                pathObject.path.push({ element: currentElement, point: point });
            }
            iteration++;
        } else {
            console.warn("infinite loop");
            break;
        }
             
    }

}

function findNextConnection(currentElement, pathObject, side) {
    let connectionFound = false;
    let nextConnection = null;
    let point = "actualPoint" //findNextConnection always starts at a connection

    while (!connectionFound) {
        console.log("h")
        const connectedElements = allElements.get(currentElement).connections[side]

        if (connectedElements.size === 1) {
            const connectedElement = connectedElements.values().next().value;

            const connectedElementObject = allElements.get(connectedElement);
            side = connectedElementObject.connections.left.has(currentElement) ? "right" : "left";
            currentElement = connectedElement;

            if (connectedElement.classList.contains("connection")) {
                connectionFound = true; 
                nextConnection = connectedElement;
                point = "actualPoint";
                console.log("success");
                console.log(nextConnection);
            } else {
                if (connectedElement.classList.contains("amperometer")) {
                    point = "actualPoint";

                    const obj = amperometers().find(object => object.element === connectedElement);

                    obj.connectedPath = pathObject.color;
                } else {
                    point = side === "left" ? "rightPoint" : "leftPoint";
                }   
            }
            
            pathObject.path.push({ element: connectedElement, point: point });
        } else if (connectedElements.size === 0) {
            pathObject.isClosed = false;
            alert("NO PATHS FOUND");
            break;
        } else {
            const values = handleBreak(connectedElements, pathObject, currentElement)
            currentElement = values.element
            nextConnection = values.element
            loopIndex = values.loopIndex
            side = values.nextSideToCheck

            //handleBreak always returns a connection and connections only have one point
            const point = "actualPoint" 

            connectionFound = true
            pathObject.path.push({element: nextConnection, point: point})
        }         
    }

    return {element: nextConnection, nextSideToCheck: side, pathObject: pathObject}
}

function checkFoundConnections(connectionPathArray) {
    const connectionsFound = new Set();

    for (let i = 0; i < connectionPathArray.length; i++) {
        const connectionPath = connectionPathArray[i]

        for (const object of connectionPath) {
            const connection = object.element

            if (connectionsFound.has(connection)) {
                return {result: true, end: connection}
            } else {
                connectionsFound.add(connection)
            }
        }
    }
    return {result: false, end: null}
}

function updateBreakArrays(shallowSearchArray, deepSearchArray, elementToUpdate, pathsFound) {
    const goodIndexes = [];

    //Checks which paths have already crossed over the wanted final element
    pathsFound.forEach((object, index) => {
        const path = object.path

        for (let i = 0; i < path.length; i++) {
            const element = path[i].element

            if (element === elementToUpdate) {
                goodIndexes.push(index)

                object.isClosed = true

                //Removes the unwanted elements from the path
                path.length = i + 1

                break
            }
        }
    })

    goodIndexes.forEach(index => {
        const wantedObject = deepSearchArray[index].find(object => object.element === elementToUpdate)

        //updates the shallowSearchArray to avoid unwanter shallow searches
        shallowSearchArray[index] = wantedObject
    })

    return goodIndexes
}

function findColor() {
    let red;
    let green;
    let blue;

    let color;
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

export function changeAllElements(newAllElements) {
    allElements = newAllElements
}