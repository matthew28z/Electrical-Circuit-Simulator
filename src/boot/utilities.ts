export async function bootApp(data: any): Promise<void> {
    await import("../app/logic/menu");

    // Import and initialize Inspector
    const { initInspector } = await import("../app/logic/inspector");
    initInspector();

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