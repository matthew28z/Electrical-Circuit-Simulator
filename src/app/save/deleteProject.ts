import { flagInput } from "./saveFunctions";

function resetText() {
    const textArea = document.querySelector<HTMLTextAreaElement>(".saveMenu textArea")!
    const input = document.querySelector<HTMLInputElement>(".saveMenu input")!;

    input.placeholder = "Type in the name of this Project";
    textArea.placeholder = "Describe this Project so you can better differentiate it from the rest";
}

//This function assumes the parameters passed are correct
export function deleteProject(name: string, button: HTMLElement, notConfirmed : boolean = true): void {
    const textArea = document.querySelector<HTMLTextAreaElement>(".saveMenu textArea")!
    const input = document.querySelector<HTMLInputElement>(".saveMenu input")!;

    if (notConfirmed && button.dataset.isConfirmed !== "yes") {
        button.dataset.isConfirmed = "yes";

        textArea.placeholder = "Are you sure?";
        input.placeholder = "This action will be permanent.";

        flagInput(input);
        flagInput(textArea);

        const confirmAction = (e: KeyboardEvent): void => {    
            window.removeEventListener("keydown", confirmAction);

            if (e.key == "Enter")
                return deleteProject(name, button, false);
        } 

        window.addEventListener("keydown", confirmAction);

        setTimeout(() => {
            window.removeEventListener("keydown", confirmAction);

            button.dataset.isConfirmed = "no"; //reset the value

            resetText();
        }, 2000);

        return;
    }
    console.log(name)
    //Remove the Project's entry
    localStorage.removeItem(name + "-P");
    
    const projectNames = localStorage.getItem("projects");

    if (!projectNames)
        throw new Error("Corrupted Project Names");

    const parsed : string[] = JSON.parse(projectNames);
    const index = parsed.indexOf(name);

    if (index < 0)
        throw new Error("Missing Project Name Data");

    parsed.splice(index, 1);

    //Filter out the project 
    localStorage.setItem("projects", JSON.stringify(parsed));

    const projectData = localStorage.getItem("projectData");

    if (!projectData)
        throw new Error("Corrupted Project Data");

    const parsedData = JSON.parse(projectData);
    
    if (!delete parsedData[name])
        throw new Error("Missing Project Data");

    //Filter out the project
    localStorage.setItem("projectData", JSON.stringify(parsedData));

    button.parentElement?.remove(); //remove the project's button

    input.placeholder = "Successful Deletion."
    textArea.placeholder = `Project ${name} Deleted.`;

    flagInput(input, true);
    flagInput(textArea, true);

    setTimeout(() => {
        resetText();
    }, 3000)

    if (parsed.length === 0) { //Checks to see if the entry deleted qas the last one
        const alertP = document.createElement("p");
        alertP.innerHTML = "<b>NO PROJECTS HAVE BEEN SAVED</b>";
        document.querySelector<HTMLElement>(".saveMenu .scrollArea")!.appendChild(alertP);
        alertP.classList.add("alertP");
    }
}