import { expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';

import { addValues, simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we put the save-copy-paste-sim mechanics under stress. We 
        create a whole new circuit, we simulate the circuit and then save it with the name "test" and immediately copy it.
        We then create a new screen and paste the circuit into the new screen. We then compare the two results
        with the expected outcome.`, async () => { 
        
            const user = userEvent.setup();

            //Create the circuit
            await simpleCircuit();

            //Save the circuit
            await saveCircuit("test");
            //Copy the circuit
            await copyCircuit("test");

            //Paste the circuit
            await user.pointer([
                { target: document.querySelector(".addScreen"), keys: "[MouseRight]" }, //create a new screen and change to it
                { target: document.getElementById("paste"), keys: "[MouseLeft]"} //paste the circuit
            ]) 

            const { allObject } = await import("../logic/management.js");

            //Check if the data was pasted correctly
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
        })