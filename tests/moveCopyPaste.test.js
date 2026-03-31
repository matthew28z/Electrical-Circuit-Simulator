import { expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';

import { addValues, simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we will be testing the accuracy of the pasting logic. We will initially create a simple circuit
    and then use the camera feature before saving and ultimately copying it. Then, we will proceed by creating
    a new screen just before using the camera feature once more. Finally we will paste the copied circuit,
    and check if the coordinates are correct.`, async() => {
            const user = userEvent.setup();

            //Create the circuit
            await simpleCircuit();

            const { allElements } = await import("../logic/paths.js");

            let coordinates = allElements.map(object => {
                const { element } = object;
                const { x, y } = element.getBoundingClientRect();
                
                return { element, x, y }; 
            });            

            await user.pointer([
                { target: document.getElementById("camera"), keys: "[MouseLeft]" },
            ]);

            await user.pointer([
                { target: document.querySelector(".screen.visible"), coords: { x: 140, y:  315 }, keys: "[MouseLeft>]" },
                { coords: { x: 370, y: 145 } }, 
                { keys: "[/MouseLeft]" }
            ]);

            //Check how accurate the initial camera movement was
            coordinates.forEach(object => {
                const { x: newX, y: newY } = object.element.getBoundingClientRect();

                expect(newX).toBe(object.x + 230);
                expect(newY).toBe(object.y - 170);
            })

            //Save the circuit
            await saveCircuit("test");
            
            coordinates = allElements.map(object => {
                const { element } = object;
                const { x, y } = element.getBoundingClientRect();
                
                return { element, x, y }; 
            });

            //Copy the circuit
            await copyCircuit("test");

            //Paste the circuit
            await user.pointer([
                { target: document.querySelector(".screen.visible"), coords: { x: 310, y:  135 }, keys: "[MouseLeft>]" },
                { coords: { x: 140, y: 325 }, keys: "[/MouseLeft]" },
                { target: document.querySelector(".addScreen"), keys: "[MouseRight]" }, //create a new screen and change to it
                { target: document.getElementById("paste"), keys: "[MouseLeft]"} //paste the circuit
            ]) 

            //Check the final calculated offsets
            coordinates.forEach(object => {
                const { x: newX, y: newY } = object.element.getBoundingClientRect();

                expect(newX).toBe(object.x - 170);
                expect(newY).toBe(object.y + 190);
            })
    })