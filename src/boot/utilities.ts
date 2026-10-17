export async function bootApp(data: any): Promise<void> {
    await import("../app/logic/menu");

    const bootDiv = document.getElementById("boot");
    const appDiv = document.getElementById("app");
    
    if (!bootDiv || !appDiv) {
        throw new Error("HTML Failed To Load.");
    }
    
    bootDiv.classList.toggle("closed");
    appDiv.classList.toggle("closed");

    if (data) {
        
    }
}