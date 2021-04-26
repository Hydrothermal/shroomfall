const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mouse = { x: null, y: null };

canvas.addEventListener("mousemove", event => {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;
});

document.getElementById("reset").addEventListener("click", () => {
    newGame();
});