import { bootApp } from "./utilities";

const bootDiv = document.getElementById('boot');

if (bootDiv) {
    // Container for the whole splash screen
    const splashContainer = document.createElement('div');
    splashContainer.classList.add('splash-container');

    // --- Background animation ---
    const bgSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bgSvg.classList.add('splash-bg-svg');
    // Draw some stylized circuit traces
    const paths = [
        "M 5% 50% L 15% 50% L 20% 30% L 35% 30%",
        "M 95% 20% L 85% 20% L 80% 40% L 65% 40%",
        "M 10% 80% L 20% 80% L 25% 65% L 40% 65%",
        "M 90% 85% L 80% 85% L 75% 70% L 60% 70%",
        "M 30% 10% L 40% 10% L 45% 25% L 60% 25%",
        "M 70% 90% L 60% 90% L 55% 75% L 40% 75%"
    ];
    paths.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.classList.add('circuit-wire');
        bgSvg.appendChild(path);
    });
    splashContainer.appendChild(bgSvg);

    // --- Content box ---
    const contentBox = document.createElement('div');
    contentBox.classList.add('splash-content');

    // Logo & Title
    const logoContainer = document.createElement('div');
    logoContainer.classList.add('logo-container');

    const logoImg = document.createElement('img');
    logoImg.src = './src/icons/appIcon.png';
    logoImg.alt = 'Zimaris Lab Logo';
    logoImg.classList.add('splash-logo');

    const title = document.createElement('h1');
    title.textContent = 'Zimaris Lab';
    title.classList.add('splash-title');

    logoContainer.appendChild(logoImg);
    logoContainer.appendChild(title);
    contentBox.appendChild(logoContainer);

    // Welcome Message
    const welcomeMsg = document.createElement('p');
    welcomeMsg.textContent = 'Welcome back! Let\'s build some circuits.';
    welcomeMsg.classList.add('splash-welcome');
    contentBox.appendChild(welcomeMsg);

    // Buttons Container
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('splash-buttons');

    // Buttons
    const btnContinue = document.createElement('button');
    btnContinue.id = 'btn-continue-project';
    btnContinue.textContent = 'Continue Latest Project';
    btnContinue.classList.add('splash-btn', 'splash-btn-primary');

    const btnNew = document.createElement('button');
    btnNew.id = 'btn-new-project';
    btnNew.textContent = 'New Project';
    btnNew.classList.add('splash-btn');

    btnNew.addEventListener("click", bootApp)

    const btnOpen = document.createElement('button');
    btnOpen.id = 'btn-open-project';
    btnOpen.textContent = 'Open Project';
    btnOpen.classList.add('splash-btn');

    const btnTutorial = document.createElement('button');
    btnTutorial.id = 'btn-tutorial';
    btnTutorial.textContent = 'Tutorial';
    btnTutorial.classList.add('splash-btn', 'splash-btn-secondary');

    // Append buttons
    buttonContainer.appendChild(btnContinue);
    buttonContainer.appendChild(btnNew);
    buttonContainer.appendChild(btnOpen);
    buttonContainer.appendChild(btnTutorial);

    contentBox.appendChild(buttonContainer);
    splashContainer.appendChild(contentBox);

    bootDiv.appendChild(splashContainer);
}
