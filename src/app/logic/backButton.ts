export function addBackButton(container: HTMLElement): void {
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.textContent = "Back";
    backButton.classList.add("backButton");
    backButton.setAttribute("aria-label", "Return to the main menu");

    backButton.addEventListener("click", () => {
        const bootDiv = document.getElementById("boot");
        const appDiv = document.getElementById("app");

        if (!bootDiv || !appDiv) {
            throw new Error("Unable to return to the main menu.");
        }

        bootDiv.classList.remove("closed");
        appDiv.classList.add("closed");
    });

    container.appendChild(backButton);
}
