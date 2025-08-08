const themeButton = document.getElementById("theme");
const body = document.body;


//functionality to change the visual theme

if (themeButton) {
    themeButton.addEventListener('click', () => {
        body.classList.toggle('inverted');
    });
}

//to toggle the menu 

const menuBtn = document.getElementById('menu-button');
const closeMenuBtn = document.getElementById('close-menu');
const fullscreenMenu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
    fullscreenMenu.classList.add('active');
    body.classList.add('menu-active');  // add class here
});

closeMenuBtn.addEventListener('click', () => {
    fullscreenMenu.classList.remove('active');
    body.classList.remove('menu-active');  // remove class here
});

const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
});
