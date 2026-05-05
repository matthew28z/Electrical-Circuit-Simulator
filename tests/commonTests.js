import { expect } from 'vitest';
import { userEvent } from "vitest/browser";

const user = userEvent.setup();

export async function simpleCircuit() {
        const screen = document.getElementById("screen-0");
        const allG = document.querySelector(".allG");

        const voltageSourceButton = document.getElementById("voltageSource");
        const connectionButton = document.getElementById("connection");
        const resistorButton = document.getElementById("resistor");

        await user.click(voltageSourceButton);

        await user.click(screen, { position: { x: 255, y: 510 } }); //create the voltage source

        const voltageSource = document.querySelector(".voltageSource");

        await user.click(connectionButton);

        await user.click(screen, { position: { x: 182, y: 550} });
        await user.click(screen, { position: { x: 398, y: 550} }); // create the connections

        const connections = document.querySelectorAll(".connection");

        await user.click(resistorButton);

        await user.click(screen, { position: { x: 255, y: 600} }); //create the resistor

        const resistor = document.querySelector(".resistor");

        //Create the wires
        const wireButton = document.getElementById("wire");

        await user.click(wireButton);

        await user.click(voltageSource); //select the voltage-source
        await user.click(connections[0]); //connect it to a connection
        await user.click(connections[0], { button: "right" }); //change the state of the connection
        await user.click(resistor); //connect that connection to the resistor
        await user.click(connections[1]); //connect the resistor to the other connection
        await user.click(connections[1], { button: "right" }); //change the other connection's state
        await user.click(voltageSource); //close the circuit 

        await user.click(voltageSource, { button: "right" }); //open the VS' tab

        await addValues([50, 0]); //add the voltage and the internal resistance

        await user.click(resistor, { button: "right" }); //open the resistor's tab

        await addValues([10]);

        const { allObject } = await import("../src/app/logic/management.js");

        //Check if the data was passed correctly
        expect(allObject.resistors[0].resistance.value).toBe(10);
        expect(allObject.voltageSources[0].voltage.value).toBe(50);
        expect(allObject.voltageSources[0].resistance.value).toBe(0);

        const { data } = await import("../src/app/calculation/data.js");

        const simulateButton = document.getElementById("run");

        await user.click(simulateButton);
    
        const mainPathData = data.values().next().value;
    
        //Check the initial calculations
        expect(mainPathData.pathResistance).toBe(10);
        expect(mainPathData.pathVoltage).toBe(50);
        expect(mainPathData.pathCurrent).toBe(5);

}

export async function saveCircuit(name) {
    await document.getElementById("save").click();

    const saveMenu = document.querySelector(".saveMenu");
    const nameInput = saveMenu.querySelector(".subSaveMenu input");

    await user.fill(nameInput, name);

    const saveButton = nameInput.parentElement.querySelector("button:not(.delete)");

    await user.click(saveButton);

    //Check if the save went through
    const savedSlot = saveMenu.querySelector(".subSaveMenu .slot");
    expect(savedSlot).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("names")).includes(name)).toBe(true);
    expect(savedSlot.querySelector("p").textContent.replace("Electrical Circuit Name:", "").trim()).toBe(name);
}

export async function addValues(values) {
    const allG = document.querySelector(".screen.visible .allG");

    const tab = allG.querySelector(".popUp");

    const rows = tab.querySelectorAll(".subTab");

    for (let i = 0; i < rows.length && i < values.length; i++) {
        const input = rows[i].querySelector("input");
    
        await user.fill(input, ""); //clears the defaults
        await user.fill(input, String(values[i])); //adds the wanted changes
    }

    await user.click(tab.querySelector(".Xbutton")); //closes the tab
}

export async function copyCircuit(name) {
    const saveMenu = document.querySelector(".saveMenu");
    
    const savedSlot = Array.from(document.querySelectorAll(".saveMenu .subSaveMenu .slot")).find(el => {
        return el.querySelector("p").textContent.replace("Electrical Circuit Name:", "").trim() === name;
    })

    expect(savedSlot).toBeTruthy();

    await user.click(savedSlot.querySelectorAll("button:not(.delete)")[1]);

    //Check if the data got copied
    expect(sessionStorage.getItem("circuitHTML")).toBeTruthy();
    expect(sessionStorage.getItem("wiresId")).toBeTruthy();
    expect(sessionStorage.getItem("allObjectId")).toBeTruthy();
    expect(sessionStorage.getItem("allElementsId")).toBeTruthy();

    await user.click(saveMenu.querySelector(".closeMenu")); //close the menu
}