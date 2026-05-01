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
let allElements : Map<HTMLElement, AE>= new Map();

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

***Mutating the data in any other way should generally be avoided***

Finally, the purpose of the **allElements** map is to help the pathfinding algorithm map the user's circuit. It is updated every time a new element is created and functions like `findPathStart`, `addNextElement`, `findMainPath`, `findBreakPaths` and `merge` from `logic/paths.ts` representing the pathfinding algorithm, are all inseperable from **allElements'** current structure.
