export function processAllElementsId(allElementsId) {
    const newAllElements = new Map();
    
    allElementsId.forEach(objectID => {
        const newObject = { element: document.getElementById(objectID.id), connections: { left: new Set(), right: new Set() } };

        objectID.connections.left.forEach(elementID => {
            const element = document.getElementById(elementID);

            newObject.connections.left.add(element);
        })

        objectID.connections.right.forEach(elementID => {
            const element = document.getElementById(elementID);
            
            newObject.connections.right.add(element);
        })

        newAllElements.set(newObject.element, newObject);
    })

    return newAllElements;
}

export function processAllObjectId(allObjectId) {
    const newAllObject = { };

    Object.keys(allObjectId).forEach((key) => {
        newAllObject[key] = allObjectId[key].map(objectId => {
            //The ids are cleared to allow for the user to load another circuit without having duplicate id names
            const element = document.getElementById(objectId.id)
            console.log(element)
            element.removeAttribute("id");

            //Object Destructuring to seperate the wanted data from the id
            const {id, ...rest} = objectId

            return {element: element, ...rest} //different use of ...
        })
    })

    return newAllObject;
}

export function processWiresId(wiresId) {
    return wiresId.map(object => {
        const wire = document.getElementById(object.id)

        //removes the IDs to prevent duplicates when loading another circuit
        wire.removeAttribute("id");

        const { id, connections, ...rest } = object

        console.log(connections.map(elID => document.getElementById(elID)))

        return {element: wire, connections: connections.map(elID => document.getElementById(elID)), ...rest}
    })
}