import { expect, test } from 'vitest';
import { userEvent, commands, page } from "vitest/browser";

import { simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we will be testing the accuracy of the pasting logic. We will initially create a simple circuit
    and then use the camera feature before saving and ultimately copying it. Then, we will proceed by creating
    a new screen just before using the camera feature once more. Finally we will paste the copied circuit,
    and check if the coordinates are correct.`, async () => {
            //Create the circuit
            await simpleCircuit();
    
            const user = userEvent.setup();

            const { allElements } = await import("../logic/paths.js");

            let coordinates = []; 
    
            for (const object of allElements) {
                const { element } = object;

                element.setAttribute("data-testid", "temp");
                console.log(element, "DEBUG");
                //const coords = await commands.boundingBox();

                element.removeAttribute("data-testid");

                //coordinates.push({ element, ...coords }); 
            }

            //Move the camera
            await user.click(document.getElementById("camera"));
    
            await commands.mouseMove({ page }, { x: 140, y: 315 });
            await commands.mouseDown({ page });
            await commands.mouseMove({ page }, { x: 370, y: 145 });
            await commands.mouseUp({ page });

            //Check how accurate the initial camera movement was
            for (const object of coordinates) {
                object.element.setAttribute("data-testid", "temp");

                //const coords = await commands.boundingBox(object.element);

                object.element.removeAttribute("data-testid");

                //expect(coords.x).toBeCloseTo(object.x + 230);
                //expect(coords.y).toBeCloseTo(object.y - 170);                
            }

            //Save the circuit
            await saveCircuit("test");
            
            for (let object of coordinates) {
                object.element.setAttribute("data-testid", "temp");

                const coords = await commands.boundingBox(object.element);

                object.element.removeAttribute("data-testid");

                object = { element: object.element, ...coords };                 
            }

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
            for (const object of coordinates) {
                object.element.setAttribute("data-testid", "temp");

                const coords = await commands.boundingBox(object.element);

                expect(coords.x).toBeCloseTo(object.x - 170);
                expect(coords.y).toBeCloseTo(object.y + 190);                
            }
    })