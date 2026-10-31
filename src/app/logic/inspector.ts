import { allObject, screen } from "./management.js";
import { allPaths, currentColor } from "./paths";
import * as d3 from "d3";

let inspectorPanel: HTMLElement | null = null;
let isCollapsed = true;

/**
 * Initializes the inspector UI by creating the DOM elements and attaching them to the body.
 */
export function initInspector() {
    if (inspectorPanel) return; // Already initialized

    const appDiv = document.getElementById("app");
    if (!appDiv) return;

    // Create main panel
    inspectorPanel = document.createElement("div");
    inspectorPanel.className = "inspector-panel collapsed";

    // Create toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "inspector-toggle-btn";
    toggleBtn.innerHTML = "⇄";
    toggleBtn.title = "Toggle Inspector";
    toggleBtn.onclick = () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            inspectorPanel!.classList.add("collapsed");
        } else {
            inspectorPanel!.classList.remove("collapsed");
            renderInspector(); // Refresh data when opened
        }
    };
    inspectorPanel.appendChild(toggleBtn);

    // Create header
    const header = document.createElement("div");
    header.className = "inspector-header";
    header.textContent = "Circuit Inspector";
    inspectorPanel.appendChild(header);

    // Create container for content
    const content = document.createElement("div");
    content.id = "inspector-content";
    inspectorPanel.appendChild(content);

    appDiv.appendChild(inspectorPanel);

    // Setup canvas click listener for two-way sync
    setupCanvasClickListener();
}

/**
 * Renders the content of the inspector panel.
 */
export function renderInspector() {
    if (!inspectorPanel || isCollapsed) return;

    const content = inspectorPanel.querySelector("#inspector-content");
    if (!content) return;

    content.innerHTML = ""; // Clear current content

    // Render Elements Section
    const elementsSection = document.createElement("div");
    elementsSection.className = "inspector-section";

    const elementsTitle = document.createElement("div");
    elementsTitle.className = "inspector-section-title";
    elementsTitle.textContent = "Elements";
    elementsSection.appendChild(elementsTitle);

    // Voltage Sources
    if (allObject.voltageSources && allObject.voltageSources.length > 0) {
        allObject.voltageSources.forEach((vs: any, index: number) => {
            const row = createRowForElement(vs, `VS-${index + 1}`, "voltage");
            elementsSection.appendChild(row);
        });
    }

    // Resistors
    if (allObject.resistors && allObject.resistors.length > 0) {
        allObject.resistors.forEach((res: any, index: number) => {
            const row = createRowForElement(res, `R-${index + 1}`, "resistance");
            elementsSection.appendChild(row);
        });
    }

    if (elementsSection.children.length > 1) {
        content.appendChild(elementsSection);
    } else {
        const noElems = document.createElement("div");
        noElems.textContent = "No elements placed.";
        noElems.style.fontSize = "12px";
        noElems.style.padding = "5px";
        elementsSection.appendChild(noElems);
        content.appendChild(elementsSection);
    }

    // Render Branches Section
    const branchesSection = document.createElement("div");
    branchesSection.className = "inspector-section";

    const branchesTitle = document.createElement("div");
    branchesTitle.className = "inspector-section-title";
    branchesTitle.textContent = "Branches";
    branchesSection.appendChild(branchesTitle);

    let hasBranches = false;
    allPaths.forEach((pathData, color) => {
        hasBranches = true;
        const row = createRowForBranch(pathData, color);
        branchesSection.appendChild(row);
    });

    if (!hasBranches) {
        const noBranches = document.createElement("div");
        noBranches.textContent = "No branches detected.";
        noBranches.style.fontSize = "12px";
        noBranches.style.padding = "5px";
        branchesSection.appendChild(noBranches);
    }

    content.appendChild(branchesSection);
}

/**
 * Creates a UI row for a circuit element.
 */
function createRowForElement(objData: any, label: string, paramName: string) {
    const element = objData.element as HTMLElement;
    const row = document.createElement("div");
    row.className = "inspector-row";
    row.dataset.elementId = label; // Just an identifier

    // Hover sync
    row.addEventListener("mouseenter", () => {
        element.classList.add("canvas-highlight-element");
    });
    row.addEventListener("mouseleave", () => {
        element.classList.remove("canvas-highlight-element");
    });

    const header = document.createElement("div");
    header.className = "inspector-row-header";

    const title = document.createElement("div");
    title.className = "inspector-row-title";
    title.textContent = `${label} (${paramName === 'voltage' ? 'Voltage Source' : 'Resistor'})`;

    const badge = document.createElement("span");
    badge.className = "solved-badge";
    badge.textContent = "Solved";
    badge.id = `badge-${label}`;

    header.appendChild(title);
    header.appendChild(badge);

    const body = document.createElement("div");
    body.className = "inspector-row-body";

    const inputGroup = document.createElement("div");
    inputGroup.className = "inspector-input-group";

    const valSpan = document.createElement("span");
    valSpan.textContent = paramName === 'voltage' ? 'V =' : 'R =';

    const input = document.createElement("input");
    input.className = "inspector-input";
    input.type = "text";

    const currentValue = objData[paramName].value;
    const isUnknown = currentValue === null;
    input.value = isUnknown ? '?' : String(currentValue);
    input.disabled = isUnknown;

    // Handle input change
    input.addEventListener("change", (e) => {
        const val = (e.target as HTMLInputElement).value;
        if (val !== '?') {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                objData[paramName].value = num;
            }
        }
    });

    const unitSpan = document.createElement("span");
    unitSpan.textContent = objData[paramName].UM || '';

    inputGroup.appendChild(valSpan);
    inputGroup.appendChild(input);
    inputGroup.appendChild(unitSpan);

    const toggleGroup = document.createElement("div");
    toggleGroup.className = "solve-for-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isUnknown;

    checkbox.addEventListener("change", (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        if (checked) {
            objData[paramName].value = null; // Mark as unknown
            input.value = '?';
            input.disabled = true;
            badge.classList.remove("visible"); // Reset badge
        } else {
            objData[paramName].value = 0; // Reset to default 0
            input.value = '0';
            input.disabled = false;
        }
    });

    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Solve For (?)";

    toggleGroup.appendChild(checkbox);
    toggleGroup.appendChild(labelSpan);

    body.appendChild(inputGroup);
    body.appendChild(toggleGroup);

    row.appendChild(header);
    row.appendChild(body);

    // Keep reference for canvas->inspector sync
    (element as any)._inspectorRow = row;

    return row;
}

/**
 * Creates a UI row for a branch (path).
 */
function createRowForBranch(pathData: any, color: string) {
    const row = document.createElement("div");
    row.className = "inspector-row";

    // Hover sync (highlight path in SVG)
    row.addEventListener("mouseenter", () => {
        if (!screen) return;
        const svg = d3.select(screen).select(".overlay");
        // Look for the wire segments with this color
        svg.selectAll("path").filter(function(this: any) {
            return d3.select(this).style("stroke") === color || d3.select(this).attr("stroke") === color;
        }).classed("canvas-highlight-branch", true);
    });
    row.addEventListener("mouseleave", () => {
        if (!screen) return;
        const svg = d3.select(screen).select(".overlay");
        svg.selectAll(".canvas-highlight-branch").classed("canvas-highlight-branch", false);
    });

    const header = document.createElement("div");
    header.className = "inspector-row-header";

    const title = document.createElement("div");
    title.className = "inspector-row-title";
    title.textContent = `Branch`;

    const colorIndicator = document.createElement("span");
    colorIndicator.style.display = "inline-block";
    colorIndicator.style.width = "12px";
    colorIndicator.style.height = "12px";
    colorIndicator.style.backgroundColor = color;
    colorIndicator.style.borderRadius = "50%";
    colorIndicator.style.marginLeft = "5px";
    title.appendChild(colorIndicator);

    header.appendChild(title);

    const body = document.createElement("div");
    body.className = "inspector-row-body";

    const resGroup = document.createElement("div");
    resGroup.className = "inspector-input-group";
    resGroup.style.marginBottom = "5px";

    const resLabel = document.createElement("span");
    resLabel.textContent = "Total Branch Resistance =";

    const resVal = document.createElement("span");
    resVal.textContent = pathData.pathResistance !== undefined ? String(pathData.pathResistance) : '0';
    resVal.style.fontWeight = "bold";

    const resUnit = document.createElement("span");
    resUnit.textContent = "Ω";

    resGroup.appendChild(resLabel);
    resGroup.appendChild(resVal);
    resGroup.appendChild(resUnit);

    const inputGroup = document.createElement("div");
    inputGroup.className = "inspector-input-group";

    const valSpan = document.createElement("span");
    valSpan.textContent = "I Constraint =";

    const input = document.createElement("input");
    input.className = "inspector-input";
    input.type = "text";

    // Check if constraint exists, otherwise leave blank or Auto
    // Since we are leaving space for the user to add it, we assume `pathData.pathCurrentConstraint` might exist
    const currentConstraint = (pathData as any).pathCurrentConstraint;
    input.value = currentConstraint !== undefined && currentConstraint !== null ? String(currentConstraint) : '';
    input.placeholder = "Auto";

    input.addEventListener("change", (e) => {
        const val = (e.target as HTMLInputElement).value.trim();
        if (val === '') {
            (pathData as any).pathCurrentConstraint = null; // Unconstrained
        } else {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                (pathData as any).pathCurrentConstraint = num;
            }
        }
    });

    const unitSpan = document.createElement("span");
    unitSpan.textContent = "A";

    inputGroup.appendChild(valSpan);
    inputGroup.appendChild(input);
    inputGroup.appendChild(unitSpan);

    body.appendChild(resGroup);
    body.appendChild(inputGroup);
    // Align items vertically for branch row
    body.style.flexDirection = "column";
    body.style.alignItems = "flex-start";

    row.appendChild(header);
    row.appendChild(body);

    return row;
}

/**
 * Canvas click listener to highlight row in inspector.
 */
function setupCanvasClickListener() {
    document.body.addEventListener("click", (e) => {
        if (!inspectorPanel || isCollapsed) return;

        const target = e.target as HTMLElement;

        let row: HTMLElement | null = null;
        if (target.classList.contains("userCreated")) {
            row = (target as any)._inspectorRow as HTMLElement;
        } else if (target.tagName.toLowerCase() === "path") {
            const color = d3.select(target).style("stroke") || d3.select(target).attr("stroke");
            if (color) {
                // Find branch row by color
                const allRows = inspectorPanel!.querySelectorAll(".inspector-row");
                for (let i = 0; i < allRows.length; i++) {
                    const r = allRows[i] as HTMLElement;
                    const colorIndicator = r.querySelector("span[style*='background-color']");
                    if (colorIndicator && (colorIndicator as HTMLElement).style.backgroundColor === color) {
                        row = r;
                        break;
                    }
                }
            }
        }

        if (row) {
            // Scroll to row
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Flash highlight
            row.classList.add("highlighted-row");
            setTimeout(() => {
                row.classList.remove("highlighted-row");
            }, 1500);
        }
    });
}

/**
 * Public function to highlight a solved value in the inspector.
 * @param element The HTML element associated with the solved value.
 * @param value The calculated value.
 * @param paramName "voltage" or "resistance"
 */
export function highlightSolvedValue(element: HTMLElement, value: number, paramName: string) {
    const row = (element as any)._inspectorRow as HTMLElement;
    if (row) {
        // Update input
        const input = row.querySelector(".inspector-input") as HTMLInputElement;
        if (input) {
            input.value = String(value);
        }

        // Show badge
        const badge = row.querySelector(".solved-badge") as HTMLElement;
        if (badge) {
            badge.classList.add("visible");
        }

        // Uncheck "Solve For" toggle so it doesn't stay marked unknown
        const checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
        if (checkbox) {
            checkbox.checked = false;
        }
        if (input) {
            input.disabled = false;
        }
    }
}
