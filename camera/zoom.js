import * as d3 from "d3";

import { allG } from "../logic/management.js";
import { changeTransform, transform } from "./move.js";

const zoom = d3.zoom()
             .scaleExtent([0.25, 4])
             .on("zoom", (event) => {
                allG.attr("transform", event.transform)
                changeTransform({x: event.transform.x, y: event.transform.y, z: event.transform.k})
             })

export function addZoom() {
    const svg = d3.select(".screen.visible");

    svg.call(zoom)

    const screen = document.querySelector(".visible");

    const reset = (event) => {
        if (event.key.toLowerCase() === "r") {
            svg.transition().duration(500/*ms*/).call(zoom.transform, d3.zoomIdentity)

        }
    }

    window.addEventListener("keydown", reset)
} 

export function removeZoom() {
    d3.select(".screen.visible").on(".zoom", null)
}