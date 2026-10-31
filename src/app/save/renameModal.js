let renameModal = null;
let currentButton = null;
let isClosing = false;

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

    // Prevent clicks inside modal container from stealing focus and triggering premature blur
    renameModal.addEventListener("mousedown", (e) => {
        if (e.target !== nameInput) {
            e.preventDefault();
        }
    });

    const applyRename = () => {
        if (isClosing) return;
        if (currentButton && nameInput.value.trim() !== "") {
            currentButton.innerHTML = nameInput.value.trim();
        }
        closeRenameModal();
    };

    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyRename();
        } else if (e.key === "Escape") {
            currentButton = null;
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
    requestAnimationFrame(() => {
        input.focus();
        input.select();
    });
}

function closeRenameModal() {
    if (renameModal && !isClosing) {
        isClosing = true;
        renameModal.classList.remove("visible");
        currentButton = null;
        const input = renameModal.querySelector("input");
        if (input) {
            input.blur();
        }
        isClosing = false;
    }
}

export { showRenameModal as renameModal };
