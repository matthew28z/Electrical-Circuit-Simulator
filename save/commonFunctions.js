export function processAllElementsId(allElementsId) {
    return allElementsId.map(object => {
        const newObject = {element: document.getElementById(object.id), connections: { left: [], right: [] }}

        newObject.connections.left = object.connections.left.map(elementId => document.getElementById(elementId)).filter(element => element !== null)
        newObject.connections.right = object.connections.right.map(elementId => document.getElementById(elementId)).filter(element => element !== null)

        return newObject;
    });
}

export function processAllObjectId(allObjectId) {
    const newAllObject = { };

    Object.keys(allObjectId).forEach((key) => {
        newAllObject[key] = allObjectId[key].map(objectId => {
            //The ids are cleared to allow for the user to load another circuit without having duplicate id names
            const element = document.getElementById(objectId.id)
            console.log(element)
            element.id = ""

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
        wire.id = ""

        const { connections, ...rest } = object

        console.log(connections.map(id => document.getElementById(id)))

        return {element: wire, connections: connections.map(id => document.getElementById(id)), ...rest}
    })
}