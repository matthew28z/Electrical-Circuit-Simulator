export function openProjectMenu() {
    const bootDiv = document.getElementById('boot');
    if (!bootDiv) return;

    // We keep the splash background SVG and the content box,
    // but replace the contents of the content box to show the project list.
    const contentBox = bootDiv.querySelector('.splash-content');
    if (!contentBox) return;

    // Hide original content children
    const originalChildren = Array.from(contentBox.children) as HTMLElement[];
    originalChildren.forEach(child => child.style.display = 'none');

    // Create Submenu Container
    const submenuContainer = document.createElement('div');
    submenuContainer.classList.add('submenu-container');

    // Submenu Header
    const submenuHeader = document.createElement('div');
    submenuHeader.classList.add('submenu-header');

    const submenuTitle = document.createElement('h2');
    submenuTitle.textContent = 'Open Project';
    submenuTitle.classList.add('submenu-title');

    const btnBack = document.createElement('button');
    btnBack.textContent = 'Back';
    btnBack.classList.add('splash-btn', 'splash-btn-secondary', 'submenu-btn-back');
    btnBack.addEventListener('click', () => {
        // Restore original content
        submenuContainer.remove();
        originalChildren.forEach(child => child.style.display = '');
    });

    submenuHeader.appendChild(submenuTitle);
    submenuHeader.appendChild(btnBack);

    // Projects List Container
    const projectsList = document.createElement('div');
    projectsList.classList.add('projects-list');

    // Mock Projects Data
    const mockProjects = [
        { name: 'Introduction to Circuits', date: '2023-10-15' },
        { name: 'Kirchhoff\'s Laws Lab', date: '2023-11-02' },
        { name: 'Final Project - Amplifier', date: '2023-12-10' }
    ];

    if (mockProjects.length === 0) {
        const noProjectsMsg = document.createElement('p');
        noProjectsMsg.textContent = 'No saved projects found.';
        noProjectsMsg.classList.add('no-projects-msg');
        projectsList.appendChild(noProjectsMsg);
    } else {
        mockProjects.forEach(project => {
            const projectBtn = document.createElement('button');
            projectBtn.classList.add('project-item-btn');

            const projectName = document.createElement('span');
            projectName.textContent = project.name;
            projectName.classList.add('project-name');

            const projectDate = document.createElement('span');
            projectDate.textContent = project.date;
            projectDate.classList.add('project-date');

            projectBtn.appendChild(projectName);
            projectBtn.appendChild(projectDate);

            // Note: Functionality to actually open the project is omitted per task instructions

            projectsList.appendChild(projectBtn);
        });
    }

    submenuContainer.appendChild(submenuHeader);
    submenuContainer.appendChild(projectsList);

    contentBox.appendChild(submenuContainer);
}
