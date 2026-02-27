import { allG } from "../logic/management.js";
import { changeTransform, transform } from "./move.js";

const svg = d3.select(".visible")

const zoom = d3.zoom()
             .scaleExtent([0.25, 4])
             .on("zoom", (event) => {
                allG.attr("transform", event.transform)
                changeTransform({x: event.transform.x, y: event.transform.y, z: event.transform.k})
             })

export function addZoom() {
    svg.call(zoom)
} 

export function removeZoom() {
    svg.on(".zoom", null)
}