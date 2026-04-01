import { vi, beforeEach } from "vitest"

import "../styles/menu.css";
import "../styles/circuit.css";
import "../styles/management.css";
import "../styles/save.css";

beforeEach(async () => {
    document.body.innerHTML =  `<div class="screen visible" id="screen-0">
                                   <svg class="overlay"></svg>
                                </div>`;

    vi.resetModules();

    await new Promise(requestAnimationFrame);

    await import("../logic/menu.js");
}) 