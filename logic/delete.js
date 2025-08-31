import { removeAllClicks } from "./commonFunctions.js";
import { wires, clickedElements } from "./wires.js";
import { allElements } from "./paths.js";
import { allObject } from "./management.js";

const body = document.body;
const screen = document.getElementById("screen");

const handleClick = (event) => {
    if (event.target.classList.contains("userCreated") || event.target.classList.contains("wire")) {
        const element = event.target

        if (element.classList.contains("wire")) { 
            //finds the information about the deleted wire/bridge
            const index = wires.findIndex(object => object.element === element)

            const notConnected = wires[index].notConnected
    
            if (!notConnected) { //prevents unecessary code from being rerun
                const connectedElements = wires[index].connections

                connectedElements.forEach(connectedElement => {
                    //Updates the allElements array
                    const newIndex = allElements.findIndex(object => object.element === connectedElement)
                   
                    const otherElement = connectedElements.filter(value => value !== connectedElement)[0]
                
                    const leftIndex = allElements[newIndex].connections.left.findIndex(value => value === otherElement)
            
                    //Updates the clickedElements array
                    const otherIndex = clickedElements.findIndex(object => object.element === connectedElement)
                    /*
                    If the element is a connection (isConnection === true), we want to leave its values as 
                    they are, i.e. true. On the other hand if it is not a connection (isConnection === false) 
                    we want to change the values to false. Hence, assigning the value of isConnection works in both 
                    scenarios.
                    */
                   const isConnection = connectedElement.classList.contains("connection")

                    if (leftIndex !== -1) { 
                        allElements[newIndex].connections.left.splice(leftIndex, 1)
                        
                        clickedElements[otherIndex].leftPoint = isConnection
                    } else {
                        const rightIndex = allElements[newIndex].connections.right.findIndex(value => value === otherElement)
                        
                        allElements[newIndex].connections.right.splice(rightIndex, 1)

                        clickedElements[otherIndex].rightPoint = isConnection
                    }
                })
            }

            //Highlights all the wires/bridges relates to the deleted element
            const wireGroupNumber = wires[index].wireGroup

            const wireGroup = wires.filter(object => object.wireGroup === wireGroupNumber)

            wireGroup.forEach(object => {
                const groupElement = object.element  
                groupElement.classList.add("highlighted")

                if (!notConnected) {
                    const lastIndex = wires.findIndex(object => object.element === groupElement)
                    wires[lastIndex].notConnected = true
                }
            })


        } else { //userCreated
            //Updates the allElements array
            const aEIndex = allElements.findIndex(object => object.element === element)
            
            const leftConnectedElements = allElements[aEIndex].connections.left
            const rightConnectedElements = allElements[aEIndex].connections.right

            loopAndUpdate(leftConnectedElements, element)
            loopAndUpdate(rightConnectedElements, element)

            //We can assign a midPoint if the user does not delete the wire, although this is not yet implemented
            allElements.splice(aEIndex, 1)

            //updates the clickedElements array
            const cEIndex = clickedElements.findIndex(object => object.element === element)

            clickedElements.splice(cEIndex, 1)

            //updates the wire array
            const wireGroupNumberSet = new Set()
            wires.forEach((object) => {
                if (object.connections.includes(element)) {
                    wireGroupNumberSet.add(object.wireGroup)
                }
            })

            wireGroupNumberSet.forEach(number => {
                loopWireGroup(number, element)
            })
        }

        //updates the specific array that represents the category of the element
        const classList = element.classList.value
        const classes = classList.split(" ")

        const wantedClass = classes.filter(value => value !== "userCreated")[0] 
        //adds an "s" (plural) to match the array's name
        const arrayName = wantedClass + "s"

        const array = allObject[arrayName]
        const elementIndex = array.findIndex(object => object.element === element)

        array.splice(elementIndex, 1)

        element.remove()
    } else {
        const highlightedElements = document.querySelectorAll(".highlighted")

        highlightedElements.forEach(element => {
            element.classList.remove("highlighted")
        })
    }
}

const deleteAll = (event) => {
    if (event.key === "Backspace" || event.key === "Delete") {
        const highlightedElements = document.querySelectorAll(".highlighted")

        if (highlightedElements) {
            highlightedElements.forEach(element => {
                const index = wires.findIndex(object => object.element === element)
                wires.splice(index, 1)

                element.remove()
        })
        }
    }
}

function loopAndUpdate(arrayToLoop, deletedElement) {
    arrayToLoop.forEach(connectedElement => {
        const newAEIndex = allElements.findIndex(object => object.element === connectedElement)

        const rightIndex = allElements[newAEIndex].connections.right.findIndex(value => value === deletedElement)
            
        //updates the clickedElements array
        const newCEIndex = clickedElements.findIndex(object => object.element === connectedElement)
        //The logic is the same as with the updates done on the clickedElements array when a wire/bridge is deleted
        const isConnection = connectedElement.classList.contains("connection")

        //removes the deleted element from the listed connections of other elements
        if (rightIndex !== -1) {
            allElements[newAEIndex].connections.right.splice(rightIndex, 1)

            clickedElements[newCEIndex].rightPoint = isConnection
        } else {
            const leftIndex = allElements[newAEIndex].connections.left.findIndex(value => value === deletedElement)
                
            allElements[newAEIndex].connections.left.splice(leftIndex, 1)

            clickedElements[newCEIndex].leftPoint = isConnection
        }
    })
}

function loopWireGroup(wireGroupNumber, deletedElement) {
    const wireGroup = wires.filter(object => object.wireGroup === wireGroupNumber)
    //the index of the element in the connections array is the same for all the groupElements of a wire group
    //const newWIndex = wires[wIndex].connections.findIndex(connection => connection === deletedElement)
    wireGroup.forEach(object => {
        const groupElement = object.element

        //For now midPoints do not exist and thus the connection is broken
        const thisIndex = wires.findIndex(object => object.element === groupElement)

        //wires[thisIndex].connections.splice(newIndex, 1)
        wires[thisIndex].connections.length = 0
        wires[thisIndex].notConnected = true

        groupElement.classList.add("highlighted")
    })
}
//adds an event listener for mass deletion of elements
window.addEventListener("keydown", deleteAll)

export const removeElement = () => {
    screen.addEventListener("click", handleClick)
}

export function removeDelete() {
    removeAllClicks(handleClick)
}