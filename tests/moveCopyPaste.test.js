import { expect, test } from 'vitest';
import { userEvent, commands, page } from "vitest/browser";

import { simpleCircuit, saveCircuit, copyCircuit } from "./commonTests.js";

test(`In this test we will be testing the accuracy of the pasting logic. We will initially create a simple circuit
    and then use the camera feature before saving and ultimately copying it. Then, we will proceed by creating
    a new screen just before using the camera feature once more. Finally we will paste the copied circuit,
    and check if the coordinates are correct.`, async () => {
    const frameBox = await commands.getBoxOfFrame();
    console.log(frameBox, "fffff")
    
            //Create the circuit
            await simpleCircuit();
    
            const user = userEvent.setup();

            const { allElements } = await import("../src/app/logic/paths.js");

            const coordinates = []; 
    
            for (const [element, object] of allElements.entries()) {
                const coords = await commands.getPositionGlobal(element.dataset.testid); 

                coordinates.push({ element, ...coords }); 
            }

            //Move the camera
            await user.click(document.getElementById("camera"));
    
            let firstPoint = await commands.mouseMove(frameBox, 140, 315);
            //await commands.showPoint({ x: frameBox.x + 140, y: framePosition.y + 315 }) //the coordinates are wrong
            await commands.mouseDown();
            let secondPoint = await commands.mouseMove(frameBox, 370, 145);
            await commands.mouseUp();

            //Check how accurate the initial camera movement was
            for (const object of coordinates) {
                const coords = await commands.getPositionGlobal(object.element.dataset.testid);

                console.log(coords);

                expect(coords.x).toBeCloseTo(object.x + secondPoint.x - firstPoint.x, 0);
                expect(coords.y).toBeCloseTo(object.y + secondPoint.y - firstPoint.y, 0); 
                
                object.x = coords.x;
                object.y = coords.y;
            }

            //Save the circuit
            await saveCircuit("test");
            
            for (const object of coordinates) {
                const coords = await commands.getPositionGlobal(object.element.dataset.testid);

                object.x = coords.x;
                object.y = coords.y;               
            }

            //Copy the circuit
            await copyCircuit("test");

            //Paste the circuit after moving the camera
            firstPoint = await commands.mouseMove(frameBox, 310, 125);
            await commands.mouseDown();
            secondPoint = await commands.mouseMove(frameBox, 140, 325);
            await commands.mouseUp();

            await page.elementLocator(document.querySelector(".addScreen")).click({ button: "right" }); //create a new screen and change to it
            await page.elementLocator(document.getElementById("paste")).click(); //paste the circuit

            const { allElements: newAllElements } = await import("../src/app/logic/paths.js");
    
            /*since the elements get copy pasted their initial position would be the same without the offset of the new screen
              thus we only need to check if the offset was calculated correctly for the elements to appear in the same spot in both screens*/
            const comparisonArray = Array.from(newAllElements.values()).map((object, index) => {
                object.x = coordinates[index].x;
                object.y = coordinates[index].y;

                return object;
            }) 
            //Check the final calculated offsets
            for (const object of comparisonArray) {
                console.log(object.element.dataset.testid, "kkkkkkkkk")
                const coords = await commands.getPositionGlobal(object.element.dataset.testid);

                console.log(object, coords, "ggggg")
                expect(coords.x).toBeCloseTo(object.x, 0); //we check if the element stayed put
                expect(coords.y).toBeCloseTo(object.y, 0);                
            }
    })