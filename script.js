const menu = document.getElementById("mobileMenu");
const button = document.getElementById("menuButton");
const overlay = document.getElementById("overlay");

button.addEventListener("click",()=>{
    menu.classList.toggle("open");
    button.classList.toggle("open");
    overlay.classList.toggle("show");
});

overlay.addEventListener("click",()=>{
    menu.classList.remove("open");
    button.classList.remove("open");
    overlay.classList.remove("show");
});