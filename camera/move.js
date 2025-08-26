const body = document.body;
const screen = document.getElementById("screen");

//Hardcodes the bodies rect
const rect = screen.getBoundingClientRect();
screen.style.width = rect.width + "px";
screen.style.height = rect.height + "px";

//Adds drag compatability
let start;
let end; 

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

    const currentTop = parseInt(screen.style.top || 0)
    const currentLeft = parseInt(screen.style.left || 0)

    //adjusts the width/height
    screen.style.width = screen.clientWidth + Math.abs(offsets.horizontalOffset) + "px"
    screen.style.height = screen.clientHeight + Math.abs(offsets.verticalOffset) + "px"

    //moves the screen
    if (offsets.verticalOffset < 0) {
        screen.style.top = currentTop + offsets.verticalOffset + "px"
    } 

    if (offsets.horizontalOffset < 0) {
        screen.style.left = currentLeft + offsets.horizontalOffset + "px"
    }
}
