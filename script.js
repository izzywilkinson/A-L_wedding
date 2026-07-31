const button = document.getElementById("menuButton");
const menu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");

function openMenu(){
    menu.classList.add("open");
    button.classList.add("open");
    overlay.classList.add("show");
}

function closeMenu(){
    menu.classList.remove("open");
    button.classList.remove("open");
    overlay.classList.remove("show");
}

button.addEventListener("click", () => {
    if(menu.classList.contains("open")){
        closeMenu();
    }else{
        openMenu();
    }
});

overlay.addEventListener("click", closeMenu);
document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", closeMenu);
});