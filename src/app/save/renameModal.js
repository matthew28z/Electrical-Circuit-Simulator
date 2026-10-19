let renameModal = null;
let currentButton = null;

function createRenameModal() {
    renameModal = document.createElement("div");
    renameModal.classList.add("renameModal");
    document.body.appendChild(renameModal);

    const instructionText = document.createElement("p");
    instructionText.innerHTML = "Rename Screen";
    renameModal.appendChild(instructionText);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    renameModal.appendChild(nameInput);

    const applyRename = () => {
        if (currentButton && nameInput.value.trim() !== "") {
            currentButton.innerHTML = nameInput.value.trim();
        }
        closeRenameModal();
    };

    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyRename();
        } else if (e.key === "Escape") {
            closeRenameModal();
        }
    });

    nameInput.addEventListener("blur", applyRename);
}

export function showRenameModal(button) {
    if (!renameModal) {
        createRenameModal();
    }

    currentButton = button;
    const input = renameModal.querySelector("input");
    input.value = button.innerHTML;

    renameModal.classList.add("visible");
    input.focus();
}

function closeRenameModal() {
    if (renameModal) {
        renameModal.classList.remove("visible");
        currentButton = null;
    }
}
