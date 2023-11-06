// check if inputs are empty
function validateInputs(inputA, inputB, inputAInput, inputBInput) {
    let isInvalid = false

    if (inputA.trim() == '') {
        inputAInput.style.outline = "2px solid red"

        setTimeout(function() {
            inputAInput.style.outline = ""; // Revert to the default outline (removing the red outline)
        }, 3000);

        isInvalid = true
    }
    if (inputB.trim() == '') {
        inputBInput.style.outline = "2px solid red"

        setTimeout(function() {
            inputBInput.style.outline = ""; // Revert to the default outline (removing the red outline)
        }, 3000);

        isInvalid = true
    }

    if (isInvalid) {
        return false
    }

    return true
}

// color RGB to Hex format
function rgbToHex(rgb) {
    // Extract the RGB values
    const [r, g, b] = rgb.match(/\d+/g);

    // Convert to hexadecimal
    const red = parseInt(r).toString(16).padStart(2, '0');
    const green = parseInt(g).toString(16).padStart(2, '0');
    const blue = parseInt(b).toString(16).padStart(2, '0');

    return `#${red}${green}${blue}`;
}

function validateColor(color) {
    const hexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    return hexColorRegex.test(color);
}

export { validateInputs, rgbToHex, validateColor }