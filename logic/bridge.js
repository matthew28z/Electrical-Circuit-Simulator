import { findAbsCotangent } from "./commonFunctions.js";
import { wires } from "./wires.js";
import { bridgeG, cBridgeG, fakeWireG } from "./management.js";

const body = document.body;
const svg = d3.select("#overlay")



const radius = 10

export function createBridge(start, end, isFake = false, intersectionPoints = null) {
    //Top half-circle arc jumping over the gap
    if (!isFake) {
        const bridge = bridgeG.append("path")
        .attr("d", `M${start.x} ${start.y} A${radius} ${radius} 0 0 1 ${end.x} ${end.y}`)
        .attr("stroke", "gold")
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .classed("wire bridge", true);     
        
        wires.push({element: bridge.node(), connections: [], intersectionPoints: intersectionPoints})
    } else {
        fakeWireG.append("path")
        .attr("d", `M${start.x} ${start.y} A${radius} ${radius} 0 0 1 ${end.x} ${end.y}`)
        .attr("stroke", "gold")
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .classed("fakeWire", true)
        .classed("wire bridge", true);       
    }
}

export function createCurrentBridge(start, end, color) {
    cBridgeG.append("path")
    .attr("d", `M${start.x} ${start.y} A${radius} ${radius} 0 0 1 ${end.x} ${end.y}`)
    .attr("stroke", color)
    .classed("current currentBridge", true);
}

export function findBridgePoints(point, oldStart, oldEnd) {
    const start = {x: null, y: null}
    const end = {x: null, y: null}

    const cotangent = findAbsCotangent(oldStart, oldEnd)

    let fix;

    if ((oldStart.x < oldEnd.x && oldStart.y < oldEnd.y) || (oldStart.x > oldEnd.x && oldEnd.y < oldStart.y)) {
        fix = -1
    } else {
        fix = 1
    }

    const dx = radius / Math.sqrt(1 + Math.pow(cotangent, -2))
    const dy = dx / cotangent * fix

    /*Math Proof 
    We want the final distance between the two points to be exactly 20 pixels. So lets say d = 20 pixels.
    Then from the Pythagorean Theorem we have that:
    d^2 = 4dx^2 + 4dy^2 <=>
    4dx^2 = d^2 - 4dy^2 (1)  
    Also we know that:
    dy = dx / cotangent (2) and
    d = 2 * radius (3)
    So (1), (2), (3) => 
    dx = radius / Math.sqrt(1 + cotangent ^ (-2))           
    */

    if (cotangent !== 0) {
        start.x = point.x - dx 
        start.y = point.y + dy //adjusts to keep the elements in line

        end.x = point.x + dx
        end.y = point.y - dy //adjusts to keep the elements in line
    } else { //line is vertical
        start.x = point.x
        start.y = point.y + radius

        end.x = point.x
        end.y = point.y - radius
    }
    //x is calculated from the left whilst y from the top thus the inconsistency with +/-   

    return {pointA: start, pointB: end}
}