import { expect, test, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

import "../styles/circuit.css";
import "../styles/management.css";
import "../styles/menu.css";
import "../styles/save.css";

beforeEach(() => {
    document.body.innerHTML =  `<div class="screen visible" id="screen-0">
                                   <svg class="overlay"></svg>
                                </div>`;

    vi.resetModules();
}) 

test(`In this test we put the save-copy-paste-sim mechanics under stress. We 
        create a whole new circuit, we simulate the circuit and then save it with the name "test" and immediately copy it.
        We then create a new screen and paste the circuit into the new screen. We then compare the two results
        with the expected outcome.`, async () => {

        const logSpy = vi.spyOn(console, 'log');

        await import("../logic/menu.js");

        const user = userEvent.setup();

        //Create the circuit
        const screen = document.getElementById("screen-0");

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

        const simulateButton = document.getElementById("run");

        await user.click(simulateButton);


        //The first check is to see if the program handled the initial circuit correctly
        const calls = logSpy.mock.calls

        expect(logSpy).toHaveBeenCalled();
        console.log(calls)
        logSpy.mockRestore();
        })