import { bootApp, justBooted } from "./utilities";

export async function continueProject() {
    if (justBooted) {
        const projectNames = localStorage.getItem("projects");
        const parsedNames: string[] = projectNames ? JSON.parse(projectNames) : [];

        if (parsedNames.length > 0)
            return bootApp(parsedNames[0]); // Load the most recent project
    }

    return bootApp(); 
}