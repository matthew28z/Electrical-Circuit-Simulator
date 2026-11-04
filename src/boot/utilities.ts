import { loadProject } from "../app/save/loadProject";

export let justBooted = true;

function resetApp() {
    if (justBooted) //avoids unecessary resets
        return;

    //A project was already initialised
    const screensOpen = Array.from(document.querySelectorAll<HTMLElement>(".screen"));
    
    screensOpen.at(0)!.textContent = "Screen-1"; // It's impossible for the first screen to not exist

    for (let i = 1; i < screensOpen.length; i++) {
        screensOpen[i].remove();
    }
}

export async function bootApp(data: string = ""): Promise<void> {
    await import("../app/logic/menu");

    const bootDiv = document.getElementById("boot");
    const appDiv = document.getElementById("app");
    
    if (!bootDiv || !appDiv) {
        throw new Error("HTML Failed To Load.");
    }
    
    resetApp();

    bootDiv.classList.toggle("closed");
    appDiv.classList.toggle("closed");

    if (data) {
        loadProject(data, true);
    }

    justBooted = false; // Reset the justBooted flag after the app has booted
}