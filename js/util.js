const images = {};

function loadImage(name, path) {
    return new Promise((resolve, reject) => {
        const img = images[name] = new Image();

        img.src = path;
        img.addEventListener("load", resolve);
    });
}

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}