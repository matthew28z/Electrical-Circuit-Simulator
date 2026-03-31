import { expect } from 'vitest';
import { page } from "vitest/browser";

export async function simpleCircuit() {
    console.log("DEBUG - page object:", page);
    console.log("DEBUG - locator type:", typeof page.elementLocator);

        const screen = page.elementLocator("#screen-0");
        const allG = page.elementLocator(".allG");

        const voltageSourceButton = page.elementLocator("#voltageSource");
        const connectionButton = page.elementLocator("#connection");
        const resistorButton = page.elementLocator("#resistor");

        await voltageSourceButton.click();

        await screen.click({ position: { x: 255, y: 102 } }) //create the voltage source

        const voltageSource = page.elementLocator(".voltageSource");

        await connectionButton.click();

        await screen.click({ position: { x: 182, y: 288} });
        await screen.click({ position: { x: 398, y: 288} }); // create the connections

        const connections = page.elementLocator(".connection");

        await resistorButton.click();

        await screen.click({ position: { x: 255, y: 333} }); //create the resistor

        const resistor = page.elementLocator(".resistor");

        //Create the wires
        const wireButton = page.elementLocator("#wire");

        await wireButton.click();

        await voltageSource.click(); //select the voltage-source
        await connections[0].click(); //connect it to a connection
        await connections[0].click({ button: "right" }); //change the state of the connection
        await resistor.click(); //connect that connection to the resistor
        await connections[1].click(); //connect the resistor to the other connection
        await connections[1].click({ button: "right" }); //change the other connection's state
        await voltageSource.click(); //close the circuit 

        await voltageSource.click({ button: "right" }) //open the VS' tab

        await addValues([50, 0]);

        await resistor.click({ button: "right"}) //open the resistor's tab

        await addValues([10]);

        const { allObject } = await import("../logic/management.js");

        //Check if the data was passed correctly
        expect(allObject.resistors[0].resistance.value).toBe(10);
        expect(allObject.voltageSources[0].voltage.value).toBe(50);
        expect(allObject.voltageSources[0].resistance.value).toBe(0);

        const { data } = await import("../calculation/data.js");

        const simulateButton = page.elementLocator("#run");

        await simulateButton.click();

        //Check the initial calculations
        expect(data[0].pathResistance).toBe(10);
        expect(data[0].pathVoltage).toBe(50);
        expect(data[0].pathCurrent).toBe(5);

}

export async function saveCircuit(name) {
    await page.elementLocator("#save").click();

    const saveMenu = page.elementLocator(".saveMenu");
    const nameInput = saveMenu.elementLocator(".subSaveMenu input");

    await nameInput.fill(name);

    const saveButton = nameInput.elementLocator("..").getByRole("button", { name: "Save"});

    await saveButton.click();

    //Check if the save went through
    const savedSlot = saveMenu.elementLocator(".subSaveMenu .slot");
    expect(savedSlot).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("names")).includes(name)).toBe(true);
    expect(savedSlot.element().querySelector("p").textContent.replace("Electrical Circuit Name:", "").trim()).toBe(name);
}

export async function addValues(values) {
    const allG = page.elementLocator(".screen.visible .allG");

    const tab = allG.elementLocator(".popUp"); //find the open tab

    const rows = tab.elementLocator(".subTab").all();

    for (let i = 0; i < rows.length && i < values.length; i++) {
        const input = rows[i].elementLocator("input");
    
        await input.fill(""); //clears the defaults
        await input.fill(values[i]); //adds the wanted changes
    }

    await tab.elementLocator(".Xbutton").click(); //closes the tab
}

export async function copyCircuit(name) {
    const saveMenu = page.elementLocator(".saveMenu");
    
    const savedSlot = Array.from(page.elementLocator(".saveMenu .subSaveMenu .slot").all()).find(el => {
        return el.elementLocator("p").element().textContent.replace("Electrical Circuit Name:", "").trim() === name;
    })

    expect(savedSlot).toBeTruthy();

    await savedSlot.elementLocator("button:not(.delete)").nth(1).click();

    //Check if the data got copied
    expect(sessionStorage.getItem("circuitHTML")).toBeTruthy();
    expect(sessionStorage.getItem("wiresId")).toBeTruthy();
    expect(sessionStorage.getItem("allObjectId")).toBeTruthy();
    expect(sessionStorage.getItem("allElementsId")).toBeTruthy();

    await saveMenu.elementLocator(".closeMenu").click(); //close the menu
}