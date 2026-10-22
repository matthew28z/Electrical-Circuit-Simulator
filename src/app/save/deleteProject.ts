const clear = setTimeout(() => {
        window.removeEventListener("keydown", confirmAction);
}, 2000);

const confirmAction = (e: KeyboardEvent) => {
    document.querySelector(".saveMenu textArea");
    document.querySelector(".saveMenu input");
    
    
}

//This function assumes the parameters passed are correct
export function deleteProject(name: string, button: HTMLElement, notConfirmed : boolean = true): void | VoidFunction {
    if (notConfirmed) {

    }
}