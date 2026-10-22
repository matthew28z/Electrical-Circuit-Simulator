import { changeAllElements } from "../logic/paths";
import { wires } from "../logic/wires";
//import { allObject, allG, screen } from "../logic/management";
import { screensObject, addScreen } from "./toggleScreens";
import { Project, Circuit } from "./saveProject";
import { processWires } from "./loadFunctions";
import { smartValues } from "../logic/management";
import { changeTransform } from "../camera/move";
import { processAllElementsId, processAllObjectId } from "./commonFunctions";

function emptyScreens(): void {
    /* This will be useful if I ever add a delete screen feature
    const screenKey = "screen" + screenIndex;
    const screenToDelete: HTMLElement | null = document.getElementById(screenKey);

    if (!screenToDelete)
        throw new Error("CORRUPTED HTML");

    screensObject[screenKey].allElements.length = 0; //empty allElements via a mutation
    Object.values(screensObject[screenKey].allObject).forEach(array => (array as any[]).length = 0); //empty allObject via a mutation
    screensObject[screenKey].x = 0;
    screensObject[screenKey].y = 0; //Mutate transform back to the original
    screensObject[screenKey].z = 1;


    //Manually deleting entries in wires to try and make it more efficient
    let isNew = true;
    let j: number;

    for (let i = wires.length - 1; i >= 0; i--) {
        if (!wires[i].parentElement?.closest("#" + screenKey)) { //filters to only wires from the wanted screen
            if (!isNew) {
                wires.splice(i + 1, j! - i) //not including the current entry

                isNew = true;
            }

            continue;
        }

        wires[i].element.remove(); //removes the elements in place to avoid extra iterations later on

        if (i == 0) {
            if (isNew) {
                wires.splice(0, 1);

                break;
            }

            wires.splice(0, j! + 1);

            break;
        }

        if (isNew) { 
            j = i;
            isNew = false;
        }
    }
    */
    wires.length = 0;

    Object.values(screensObject).forEach(obj => {
        obj.allElements.length = 0;
        Object.values(obj.allObject).forEach(arr => (arr as any[]).length = 0);
        obj.transform = { x: 0, y: 0, z: 1 };
    })

    //Now all the data stored is corrected and we move on to deleting everything on the screen
    Array.from(document.querySelectorAll<SVGElement>(".markerG > *, .bridgeG > *, .wireG > *, .currentG > *, .cBridgeG > *, foreignObject")).forEach(el => el.remove());
}

function loadOnScreen(screen: HTMLElement, circuit: Circuit): void {
    //Gets the index to find the connected ScreenButton
    const index = screen.id.slice(-1);
    const screenButton = document.getElementById("ScreenButton-" + index);

    if (!screenButton) 
        throw new Error("Corrupted HTML (ScreenButton)")

    screenButton.textContent = circuit.name; //Visualises the name

    //The wires are common for the project and this function doesnt handle them
    screen.innerHTML = circuit.data.circuitHTML; 

    //Updates the screen's data
    const key = "screen_" + index;

    screensObject[key].allElements = processAllElementsId(circuit.data.allElementsId);
    screensObject[key].allObject = processAllObjectId(circuit.data.allObjectId);

    //screensObject["screen_" + index].transform = 
}

function prepareForLoad(data: Project) : void  {
    const screens: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(".screen"));

    if (data.circuits.length > screens.length) { //checks to see whether or not the current screens are enough
        //create new empty screens
        for (let i = screens.length; i < data.circuits.length; i++) {
            addScreen();
        }
    } else if (data.circuits.length < screens.length) {
        //Delete the excess screens data
        const keys: string[] = Object.keys(screensObject);

        for (let i = data.circuits.length; i < screens.length; i++) {
            delete screensObject[keys[i]];
        }

        //correctly removes excess screens
        Array.from(document.querySelectorAll<HTMLElement>(".screen")).forEach((screenToDelete, index) => {
            if (index >= data.circuits.length)
                screenToDelete.remove();
        });

        Array.from(document.querySelectorAll<HTMLElement>(".screensDiv button")).forEach((screenButton, index) => {
            if (index >= data.circuits.length)
                screenButton.remove();
        });
    }

    return;
}

/*
This function aims to load a saved project, the second parameter allows for the same function to be used
in the boot menu as it skips the cleaning part of the previous data
*/
export function loadProject(name: string, justBooted: boolean = false): void {
    //check with the user before deleting anything
    const response: string | null = window.prompt(`This action will permenantly deleted all the 
                                            unsaved circuitry currently shown on the screen, are you certain
                                            you want to proceed with this request?`, "Yes");
    
    if (response?.toLowerCase() !== "yes")
        return;
    
    //Gets all the projects from localStorage
    const allProjectSavedData: string | null = localStorage.getItem("projectData");

    if (!allProjectSavedData)
        throw new Error("ALL PROJECT DATA HAVE BEEN LOST");

    //Gets the specific project's data
    const data: Project | null = JSON.parse(allProjectSavedData)[name];

    if (!data)
        throw new Error(`PROJECT'S ${name} DATA HAS BEEN CORRUPTED`);

    console.log(data)
    prepareForLoad(data);

    if (!justBooted) {
        emptyScreens();
    }

    processWires(data.wiresId); //handles the wires as of V0.0.8 they are common across  screens

    //If everything is working correctly screens and data.circuits should have the same length
    const screens = document.querySelectorAll<HTMLElement>(".screen");

    for (let i = 0; i < data.circuits.length; i++) {
        const circuit = data.circuits[i];

        loadOnScreen(screens[i], circuit);
    }

    //Reset back to the starting screen
    changeAllElements(screensObject["screen_0"].allElements);
    smartValues({ nScreen: screens[0], nAllObject: screensObject["screen_0"].allObject });
    changeTransform(screensObject["screen_0"].transform);

    //Checks to see if the last active screen was deleted
    const lastActiveScreenButton = document.querySelector<HTMLElement>(".currentScreenButton");

    if (lastActiveScreenButton) { // it wasnt
        lastActiveScreenButton.classList.remove("currentScreenButton");
        
        const index : string = lastActiveScreenButton.id.slice(-1);
        document.getElementById("screen-" + index);
    }

    screens[0].classList.add("visible");
    document.getElementById("ScreenButton-0")?.classList.add("currentScreenButton");
}