import { vi, beforeEach } from "vitest"

import "./src/styles/menu.css";
import "./src/styles/circuit.css";
import "./src/styles/management.css";
import "./src/styles/save.css";

beforeEach(async () => {
    document.body.innerHTML =  `<svg style="position: absolute; width: 0; height: 0">
                                    <defs>
                                        <marker id="yellowMark" 
                                            viewBox="0 0 20 10" 
                                            refX="12" 
                                            refY="5" 
                                            markerWidth="10" 
                                            markerHeight="10" 
                                            orient="auto-start-reverse">
                                                <path d="M 0,5 L 6,5" stroke="gold" stroke-width="2" fill="none" />
                                        </marker>

                                        <marker id="purpleMark" 
                                            viewBox="0 0 20 10" 
                                            refX="12" 
                                            refY="5" 
                                            markerWidth="10" 
                                            markerHeight="10" 
                                            orient="auto-start-reverse">
                                                <path d="M 0,5 L 6,5" stroke="purple" stroke-width="2" fill="none"/>
                                        </marker>
                                    </defs>
                                </svg>
    
                                <div class="screen visible" id="screen-0">
                                   <svg class="overlay"></svg>
                                </div>`;

    vi.resetModules();

    await new Promise(requestAnimationFrame);

    await import("../src/app/logic/menu.js");
    
    let tracker = 0;

    //The observer should be applied
    const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(el => {
                    console.log(el, "test")
                    if (el instanceof SVGForeignObjectElement) {
                        console.log("subtest")
                        el.querySelector("div").dataset.testid = `element-${tracker++}`;
                        console.log(el)
                    } else if (el instanceof HTMLElement && el.classList.contains("element")) {
                        el.dataset.testid = `element-${tracker++}`;
                    }
                })
            }
        }
    });

    observer.observe(document.body, { 
        childList: true,  
        subtree: true,    
        attributes: false 
    });
}) 