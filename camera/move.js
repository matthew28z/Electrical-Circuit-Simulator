const body = document.body;
const screen = document.getElementById("screen");

//Adds drag compatability
let start;
let end; 

export const transform = {x: 0, y: 0};

const move = (event) => {
    start = {x: event.clientX, y: event.clientY}

    window.addEventListener("mouseup", mouseUp)
}

export function addMove() {
    window.addEventListener("mousedown", move)
}

export function removeMove() {
    window.removeEventListener("mousedown", move)
}

const mouseUp = (event) => {
    end = {x: event.clientX, y: event.clientY}

    window.removeEventListener("mouseup", mouseUp)

    adjustScreen(calculateOffset(start, end))
}


function calculateOffset(start, end) {
    const verticalOffset = Math.round(end.y - start.y)
    const horizontalOffset = Math.round(end.x - start.x)

    return {verticalOffset: verticalOffset, horizontalOffset: horizontalOffset}
}

function adjustScreen(offsets) {
    const rect = screen.getBoundingClientRect()

    const elements = screen.querySelectorAll("*")

    transform.x += offsets.horizontalOffset
    transform.y += offsets.verticalOffset

    elements.forEach(element => {
        element.style.transform = `translate(${transform.x}px, ${transform.y}px)`
    });


    /*
    //adjusts the width/height
    screen.style.width = screen.clientWidth + Math.abs(offsets.horizontalOffset) + "px"
    screen.style.height = screen.clientHeight + Math.abs(offsets.verticalOffset) + "px"

    //moves the screen
    const transform = window.getComputedStyle(screen).transform

    if (transform !== "none") {
        const values = transform.match(/matrix\((.+)\)/)[1].split(", ");
        values.splice(0, values.length - 2)
        
        const currentX = parseInt(values[0])
        const currentY = parseInt(values[1])

        const x = currentX + offsets.horizontalOffset
        const y = currentY + offsets.verticalOffset

        screen.style.transform = `translate(${x}px, ${y}px)`
        
        console.log(currentX, currentY)
    } else { //First time moving the screen
        screen.style.transform = `translate(${offsets.horizontalOffset}px, ${offsets.verticalOffset}px)`
    }*/
    /*    
    if (offsets.verticalOffset < 0) {
        screen.style.top = currentTop + offsets.verticalOffset + "px"
    } 

    if (offsets.horizontalOffset < 0) {
        screen.style.left = currentLeft + offsets.horizontalOffset + "px"
    }*/
}
