import { vi, beforeEach } from "vitest"

import "../styles/menu.css";
import "../styles/circuit.css";
import "../styles/management.css";
import "../styles/save.css";

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

    await import("../logic/menu.js");
}) 