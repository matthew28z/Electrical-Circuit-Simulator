import { expect } from 'vitest';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

export async function simpleCircuit() {
        const screen = document.getElementById("screen-0");
        const allG = document.querySelector(".allG");

        const voltageSourceButton = document.getElementById("voltageSource");
        const connectionButton = document.getElementById("connection");
        const resistorButton = document.getElementById("resistor");

        await user.click(voltageSourceButton);

        await user.pointer([{ target: screen, coords: { x: 255, y: 102 }, keys: "[MouseLeft]" }]) //create the voltage source
        const voltageSource = document.querySelector(".voltageSource");

        await user.click(connectionButton);

        await user.pointer([
            { target: screen, coords: { x: 182, y: 288 }, keys: "[MouseLeft]" },
            { coords: { x: 398, y: 288 }, keys: "[MouseLeft]" }
        ]) // create the connections

        const connections = document.querySelectorAll(".connection");

        await user.click(resistorButton)

        await user.pointer([{ target: screen, coords: { x: 255, y: 333 }, keys: "[MouseLeft]" }])

        const resistor = document.querySelector(".resistor");

        //Create the wires
        const wireButton = document.getElementById("wire");

        await user.click(wireButton);

        await user.pointer([
            { target: voltageSource, keys: "[MouseLeft]" }, //select the voltage-source
            { target: connections[0], keys: "[MouseLeft]" }, //connect it to a connection
            { keys: "[MouseRight]" }, //change the state of the connection
            { target: resistor, keys: "[MouseLeft]" }, //connect that connection to the resistor
            { target: connections[1], keys: "[MouseLeft]" }, //connect the resistor to the other connection
            { keys: "[MouseRight]" }, //change the other connection's state
            { target: voltageSource, keys: "[MouseLeft]" }, //close the circuit
        ])

        await user.pointer([{ target: voltageSource, keys: "[MouseRight]" }]) //open the VS' tab

        await addValues([50, 0]);

        await user.pointer([{ target: resistor, keys: "[MouseRight]" }]) //open the resistor's tab

        await addValues([10]);

        const { allObject } = await import("../logic/management.js");

        //Check if the data was passed correctly
        expect(allObject.resistors[0].resistance.value).toBe(10);
        expect(allObject.voltageSources[0].voltage.value).toBe(50);
        expect(allObject.voltageSources[0].resistance.value).toBe(0);

        const { data } = await import("../calculation/data.js");

        const simulateButton = document.getElementById("run");

        await user.click(simulateButton);

        //Check the initial calculations
        expect(data[0].pathResistance).toBe(10);
        expect(data[0].pathVoltage).toBe(50);
        expect(data[0].pathCurrent).toBe(5);

}

export async function saveCircuit(name) {
    await user.click(document.getElementById("save"));

    const saveMenu = document.querySelector(".saveMenu");
    const nameInput = saveMenu.querySelector(".subSaveMenu input");

    await user.type(nameInput, name);

    const saveButton = nameInput.parentElement.querySelector("button");

    await user.click(saveButton);

    //Check if the save went through
    const savedSlot = saveMenu.querySelector(".subSaveMenu .slot");
    expect(savedSlot).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("names")).includes(name)).toBe(true);
    expect(savedSlot.querySelector("p").textContent.replace("Electrical Circuit Name:", "").trim()).toBe(name);
}

export async function addValues(values) {
    const allG = document.querySelector(".screen.visible .allG");

    const tab = allG.querySelector(".popUp"); //find the open tab

    const rows = tab.querySelectorAll(".subTab");

    for (let i = 0; i < rows.length && i < values.length; i++) {
        const input = rows[i].querySelector("input");
    
        await user.clear(input); //clears the defaults
        await user.type(input, `${values[i]}`); //adds the wanted changes

        console.log(input.value)
    }

    await user.click(tab.querySelector(".Xbutton")); //closes the tab
}

export async function copyCircuit(name) {
    const saveMenu = document.querySelector(".saveMenu");
    
    const savedSlot = Array.from(document.querySelectorAll(".saveMenu .subSaveMenu .slot")).find(el => {
        return el.querySelector("p").textContent.replace("Electrical Circuit Name:", "").trim() === name;
    })

    expect(savedSlot).toBeTruthy();

    await user.click(savedSlot.querySelectorAll("button:not(.delete")[1])

    //Check if the data got copied
    expect(sessionStorage.getItem("circuitHTML")).toBeTruthy();
    expect(sessionStorage.getItem("wiresId")).toBeTruthy();
    expect(sessionStorage.getItem("allObjectId")).toBeTruthy();
    expect(sessionStorage.getItem("allElementsId")).toBeTruthy();

    await user.click(saveMenu.querySelector(".closeMenu")); //close the menu
}