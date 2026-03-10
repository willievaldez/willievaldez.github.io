function GetColorFor(colorName, value)
{
    let color = null;
    if (colorName == "red")
    {
        color = `rgb(${value}, 0, 0)`;
    }
    else if (colorName == "green")
    {
        color = `rgb(0, ${value}, 0)`;
    }
    else if (colorName == "blue")
    {
        color = `rgb(0, 0, ${value})`;
    }

    return color;
}

// Source - https://stackoverflow.com/a/5624139
// Posted by Tim Down, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-03, License - CC BY-SA 4.0

function rgbToHex(r, g, b) {
    const hex = "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    return hex.toUpperCase();
}

function SetupPallete()
{
    if (!localStorage.currentPallete)
    {
        localStorage.currentPallete = 0;
    }
    
    for (let i = 0; i < 10; ++i)
    {
        const pallete = document.querySelector(`#pallete-${i}`);
        const selected = i == localStorage.currentPallete;
        pallete.className = selected ? "selected" : "";
        for (let colorName of ["red", "green", "blue"])
        {
            const localStorageId = `pallete${i}-${colorName[0]}`;
            if (!localStorage[localStorageId])
            {
                localStorage[localStorageId] = 100;
            }

            if (selected)
            {
                const Slider = document.querySelector(`#${colorName}-slider`);
                const SliderPreview = document.querySelector(`#${colorName}-preview`);
                const SliderText = document.querySelector(`#${colorName}-text`);

                SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[localStorageId]);
                SliderText.textContent = localStorage[localStorageId];
                Slider.value = localStorage[localStorageId];
            }
        }

        const colorValue = rgbToHex(localStorage[`pallete${i}-r`],localStorage[`pallete${i}-g`],localStorage[`pallete${i}-b`]);
        pallete.style.backgroundColor = colorValue;
        pallete.textContent = colorValue;
        const sum = parseInt(localStorage[`pallete${i}-r`])+ parseInt(localStorage[`pallete${i}-g`])+ parseInt(localStorage[`pallete${i}-b`]);
        pallete.style.color = sum > 382.5 ? "black" : "white";


        pallete.onclick = function()
        {
            document.querySelector(`#pallete-${localStorage.currentPallete}`).className = "";
            localStorage.currentPallete = i;
            this.className = "selected";

            for (let colorName of ["red", "green", "blue"])
            {
                const Slider = document.querySelector(`#${colorName}-slider`);
                const SliderPreview = document.querySelector(`#${colorName}-preview`);
                const SliderText = document.querySelector(`#${colorName}-text`);
                const localStorageId = `pallete${localStorage.currentPallete}-${colorName[0]}`;

                SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[localStorageId]);
                SliderText.textContent = localStorage[localStorageId];
                Slider.value = localStorage[localStorageId];
            }
        }
    }
}

function SetupColorSliders(callback = null, previewId = null)
{
    for (let colorName of ["red", "green", "blue"])
    {
        const Slider = document.querySelector(`#${colorName}-slider`);
        const SliderPreview = document.querySelector(`#${colorName}-preview`);
        const SliderText = document.querySelector(`#${colorName}-text`);
        const localStorageId = `pallete${localStorage.currentPallete}-${colorName[0]}`;

        if (!localStorage[localStorageId])
        {
            localStorage[localStorageId] = 100;
        }

        SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[localStorageId]);
        SliderText.textContent = localStorage[localStorageId];
        Slider.value = localStorage[localStorageId];

        function callbackWrapper() {
            const pallete = document.querySelector(previewId ? previewId : `#pallete-${localStorage.currentPallete}`);
            const colorValue = rgbToHex(dqsValue('#red-slider'), dqsValue('#green-slider'), dqsValue('#blue-slider'));
            pallete.style.backgroundColor = colorValue;
            pallete.textContent = colorValue;

            const sum = parseInt(dqsValue('#red-slider'))+ parseInt(dqsValue('#green-slider'))+ parseInt(dqsValue('#blue-slider'));
            pallete.style.color = sum > 382.5 ? "black" : "white";

            if (callback)
            {
                callback();
            }
        }

        callbackWrapper();

        Slider.oninput = function() {
            SliderPreview.style.backgroundColor = GetColorFor(colorName, this.value);
            SliderText.textContent = this.value;
            localStorage[`pallete${localStorage.currentPallete}-${colorName[0]}`] = this.value;
            callbackWrapper();
        }
    }
}