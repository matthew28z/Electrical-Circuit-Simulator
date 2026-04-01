import { expect, test } from 'vitest';
import { userEvent, commands } from "vitest/browser";

import { simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we will be testing the accuracy of the pasting logic. We will initially create a simple circuit
    and then use the camera feature before saving and ultimately copying it. Then, we will proceed by creating
    a new screen just before using the camera feature once more. Finally we will paste the copied circuit,
    and check if the coordinates are correct.`, async () => {
            //Create the circuit
            await simpleCircuit();
    
            const user = userEvent.setup();

            const { allElements } = await import("../logic/paths.js");

            let coordinates = allElements.map(object => {
                const { element } = object;

                const { x, y } = element.getBoundingClientRect();
                
                return { element, x, y }; 
            });  

            //Move the camera
            await user.click(document.getElementById("camera"));
    
            await commands.mouseMove({ x: 140, y: 315 });
            await commands.mouseDown();
            await commands.mouseMove({ x: 370, y: 145 });
            await commands.mouseUp();

            //Check how accurate the initial camera movement was
            coordinates.forEach(object => {
                const { x: newX, y: newY } = object.element.getBoundingClientRect();

                expect(newX).toBe(object.x + 230);
                expect(newY).toBe(object.y - 170);
            })

            //Save the circuit
            await saveCircuit("test");
            
            coordinates = coordinates.map(object => {
                const { x, y } = object.element.getBoundingClientRect();

                return { element: object.element, x, y };
            })

            //Copy the circuit
            await copyCircuit("test");

            //Paste the circuit after moving the camera
            await commands.mouseMove({ x: 310, y: 125 });
            await commands.mouseDown();
            await commands.mouseMove({ x: 140, y: 325 });
            await commands.mouseUp();

            await page.elementLocator(document.querySelector(".addScreen")).click({ button: "right" }); //create a new screen and change to it
            await page.elementLocator(document.getElementById("paste")).click(); //paste the circuit

            //Check the final calculated offsets
            coordinates.forEach(object => {
                const { x: newX, y: newY } = object.element.getBoundingClientRect();

                expect(newX).toBe(object.x - 170);
                expect(newY).toBe(object.y + 190);
            })
    })