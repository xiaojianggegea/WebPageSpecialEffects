"use strict";

const canvas = document.querySelector("canvas"),
      ctx = canvas.getContext('2d', {lowLatency: true, alpha: false}),
      scale = 7, // Size of pixels
      intensity = 1200, // Heat of the flame
      cooling = 0.48; // Height of the flame

let play = true,
    imageData,
    matrix,
    w, h;

const loop = () => {

  //Loop through all of the pixels
  for (let i = 0; i < matrix.length; i++) {

    const pixel = i + w - Math.random() + 1.5 >> 0; // Current pixel
    const sum = matrix[pixel] + matrix[pixel + 1] + matrix[pixel - w] + matrix[pixel - w + 1]; // Sum of the surrounding matrix intensities
    const value = i < matrix.length - w ? sum * cooling * Math.random() + 0.5 >> 0 : intensity * Math.random();

    matrix[i] = value; // Update the matrix intensity

    imageData.data[i * 4] = value * 4; // Set red channel
    imageData.data[i * 4 + 1] = value; // Set green channel
    imageData.data[i * 4 + 2] = value * 0.25 + 0.5 >> 0; // Set blue channel

  }

  ctx.putImageData(imageData, 0, 0); // Push the updated image data back to the canvas
  play && requestAnimationFrame(loop); // Loop again if playing

};

//Window resize handler. stretches the canvas to fit screen and refreshes image data array.
const resize = () => {

  w = canvas.width = window.innerWidth / scale >> 0; // Divide the width by the scale variable, then bitwise floor
  h = canvas.height = window.innerHeight / scale >> 0; // Divide the height by the scale variable, then bitwise floor

  ctx.fillRect(0, 0, w, h);
  imageData = ctx.getImageData(0, 0, w, h); // Grab the initial canvas image data
  matrix = new Uint16Array(w * h); // Create the array for storing color intensity values

};

const move = (event) => {

  let p = event;

  if (event.type === "touchmove") {
    event.preventDefault();
    p = event.targetTouches[0];
  }

  let x = Math.round((p.clientX - canvas.offsetLeft) / scale);
  let y = Math.round((p.clientY - canvas.offsetTop) / scale);

  matrix[y * w + x] = 8192 * Math.random();

}

const toggle = () => {
  play = !play; // Invert the boolean
  play && loop(); // If true, start the loop
}

//Attach event handlers
canvas.addEventListener("mousemove", move, false);
canvas.addEventListener("touchmove", move, false);
window.onresize = resize;
window.onclick = toggle;

resize(); // Call the resize function once to size the canvas and set up arrays
loop(); // Start the loop.