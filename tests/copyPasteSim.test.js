import { expect, test } from 'vitest';
import { userEvent } from "vitest/browser";

import { simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we put the save-copy-paste-sim mechanics under stress. We 
        create a whole new circuit, we simulate the circuit and then save it with the name "test" and immediately copy it.
        We then create a new screen and paste the circuit into the new screen. We then compare the two results
        with the expected outcome.`, async () => { 
            //Create the circuit
            await simpleCircuit();

            //Save the circuit
            await saveCircuit("test");
            //Copy the circuit
            await copyCircuit("test");
    
            const user = userEvent.setup();
    
            //Paste the circuit
            await user.click(document.querySelector(".addScreen"), { button: "right" });//create a new screen and change to it
            await user.click(document.getElementById("paste")); //paste the circuit

            const { allObject } = await import("../logic/management.js");

            //Check if the data was pasted correctly
            expect(allObject.resistors[0].resistance.value).toBe(10);
            expect(allObject.voltageSources[0].voltage.value).toBe(50);
            expect(allObject.voltageSources[0].resistance.value).toBe(0);

            const { data } = await import("../calculation/data.js");

            await user.click(document.getElementById("run"));

            const dataIterator = data.values();
            dataIterator.next();
    
            const mainPathData = dataIterator.next().value;
    
            //Check the initial calculations
            expect(mainPathData.pathResistance).toBe(10);
            expect(mainPathData.pathVoltage).toBe(50);
            expect(mainPathData.pathCurrent).toBe(5);
        })