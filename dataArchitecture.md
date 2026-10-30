# Data Architecture

## Overview
This file explains how data is stored in this application and how it cam be safely mutated/changed

## Contents:
### (A) allElements Map
* *(B) clickedElements Array*
### (C) allObject Object
### (D) wires Array
### (E) data Array

## ***allElements Map***
This map is one of the main driving forces for the totality of the software, the best quick description of it would be that of an adjacency list. 
Its structure is already well documented in its file of origin `logic/paths.ts`
```typescript
let allElements : Map<HTMLElement, AE> = new Map();

interface connectionList {
    left: Set<HTMLElement>;
    right: Set<HTMLElement>;
}

interface AE {
    element: HTMLElement;
    connections: connectionList;
}
```

***It is important to note that as of version v0.0.6 allElements has been converted into a map instead of an array***

A big part of the design philosophy of the software was for the data to actually be reassignable. This is because each screen a user may create holds its own set of data and thus is completely seperate from the rest. Hence, each instance of an **allElements** map is tied to a **user-created** screen.

For the reassignment to work across all the modules simultaneously the `changeAllElements` function was defined 
```typescript
function changeAllElements(newAllElements: Map<HTMLElement, AE>): void {
    allElements = newAllElements;
}
```

***CALLING THIS FUNCTION IS THE ONLY VALID WAY FOR THE **allElements** MAP TO BE REASSIGNED***

On the other hand, mutations of the aforementioned data are handled by the `updateAllElements` function
```typescript
function updateAllElements(
    element: HTMLElement,
    connectedElement: HTMLElement | null = null,
    side: side | null = null
) : void {
    const objectToUpdate : AE | undefined = allElements.get(element);

    if (!objectToUpdate) { 
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
        objectToUpdate.connections[side].add(connectedElement); 
    }    
}
```
With this philosophy, mutations only affect the current screen whilst a reassignment affects a new screen, thus keeping them completely independent of eachother.

***Mutating the data in any other way should generally be avoided***

Finally, the purpose of the **allElements** map is to help the pathfinding algorithm map the user's circuit. It is updated every time a new element is created and functions like `findPathStart`, `addNextElement`, `findMainPath`, `findBreakPaths` and `merge` from `logic/paths.ts` representing the pathfinding algorithm, are all inseperable from **allElements'** current structure.

The pathfinding algorithm produces two new data structures used by the Calculation Engine. Those are:
- allPaths
```Typescript
const allPaths: Map<currentColor, currentPathData> = new Map();

type currentColor = `rgb(${number}, ${number}, ${number})`;

interface pathObject {
    element: HTMLElement;
    point: point;
}

interface currentPathData {
    color: currentColor;
    path: (pathObject | number)[];
    isClosed: boolean;
    descendantOf?: currentColor;
}
```
This data structure is the main product of the algorithm, it finds every possible branch and stores everything it contains. It is important to not that an element of a branch may not be a single electrical element but rather a whole other set of parallel branches. To signal this, a number is stored instead of a pathObject (the custom data-type for electrical elements of this data) with a unique property. That number must be the exact index of the array of parallel branches (paths) in the breaks array. 
- breaks
```Typescript
const breaks: currentPathData[][] = [];
```
This data structure is complimentary to the previous one. In reality the two could simply be merged into one, yet the two way method makes for a better seperation of concerns. Each entry in this array is another array. It is important to remember that the entries of the inner arrays are paths just like the values in the <key, value> pair of the allPaths data type. All those paths are parallel to each other. Hence, parallel paths are easily accessible.

Together these two data structures are used by the **ZiL Engine Basic** (v2.2.1) to make calculations. The aforementioned engine also has a custom data structure that is used both during the calculations but also as the final output of the engine.
```Typescript
interface simData {
    path: currentColor;
    pathResistance: number | null;
    pathVoltage: number | null;
    pathCurrent: number | null;
    splitsTo: currentColor[][];
    parallelTo: Set<currentColor>;
    descendantOf: currentColor | undefined;
}

const data : Map<currentColor, simData> = new Map();
```
Once finished, the engine outputs a map whose keys are all the **unique** colors of the circuits branches (found from the pathFinding algorithm) and values are the associated branch data like total voltage etc. Through them, you can find any voltage or current in any element of a branch.