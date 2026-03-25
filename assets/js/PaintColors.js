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

    function setSelectedSliderData(palleteNum)
    {
        document.querySelector(`#pallete-${localStorage.currentPallete}`).className = "";
        localStorage.currentPallete = palleteNum;
        const eraser = palleteNum == 9;
        document.querySelector(`#pallete-${localStorage.currentPallete}`).className = "selected";

        for (let colorName of ["red", "green", "blue"])
        {
            const Slider = document.querySelector(`#${colorName}-slider`);
            const SliderPreview = document.querySelector(`#${colorName}-preview`);
            const SliderText = document.querySelector(`#${colorName}-text`);

            if (!eraser)
            {
                const localStorageId = `pallete${localStorage.currentPallete}-${colorName[0]}`;
                SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[localStorageId]);
                SliderText.textContent = localStorage[localStorageId];
                Slider.value = localStorage[localStorageId];
                Slider.disabled = false;
            }
            else
            {
                SliderPreview.style.backgroundColor = "#FFFFFF";
                SliderText.textContent = "#NIL";
                Slider.value = 255;
                Slider.disabled = true;
            }
        }
    }
    
    // Setup first 9 palletes; 10th pallete is reserved as eraser
    for (let i = 0; i < 10; ++i)
    {
        const pallete = document.querySelector(`#pallete-${i}`);
        const selected = i == localStorage.currentPallete;
        const eraser = i == 9;
        pallete.className = "";

        for (let colorName of ["red", "green", "blue"])
        {
            const localStorageId = `pallete${i}-${colorName[0]}`;
            if (!eraser && !localStorage[localStorageId])
            {
                localStorage[localStorageId] = 100;
            }
        }

        if (selected)
        {
            setSelectedSliderData(i);
        }

        if (!eraser)
        {
            const colorValue = rgbToHex(localStorage[`pallete${i}-r`],localStorage[`pallete${i}-g`],localStorage[`pallete${i}-b`]);
            pallete.textContent = colorValue;
            pallete.style.backgroundColor = colorValue;
            
            const sum = parseInt(localStorage[`pallete${i}-r`])+ parseInt(localStorage[`pallete${i}-g`])+ parseInt(localStorage[`pallete${i}-b`]);
            pallete.style.color = sum > 382.5 ? "black" : "white";
        }
        else
        {
            pallete.textContent = "Eraser";
            pallete.style.backgroundColor = "#BBBBBB";
            pallete.style.color = "black";
        }

        pallete.onclick = function() { setSelectedSliderData(i); };
    }
}

function SetupColorSliders(callback = null, previewId = null)
{
    const eraser = localStorage.currentPallete == 9;
    for (let colorName of ["red", "green", "blue"])
    {
        const Slider = document.querySelector(`#${colorName}-slider`);
        const SliderPreview = document.querySelector(`#${colorName}-preview`);
        const SliderText = document.querySelector(`#${colorName}-text`);

        if (!eraser)
        {
            const localStorageId = `pallete${localStorage.currentPallete}-${colorName[0]}`;
            if (!localStorage[localStorageId])
            {
                localStorage[localStorageId] = 100;
            }

            SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[localStorageId]);
            SliderText.textContent = localStorage[localStorageId];
            Slider.value = localStorage[localStorageId];
            Slider.disabled = false;
        }
        else
        {
            SliderPreview.style.backgroundColor = "#FFFFFF";
            SliderText.textContent = "#NIL";
            Slider.value = 255;
            Slider.disabled = true;
        }

        function callbackWrapper() {
            const pallete = document.querySelector(previewId ? previewId : `#pallete-${localStorage.currentPallete}`);
            const eraser = localStorage.currentPallete == 9;
            if (!eraser)
            {
                const colorValue = rgbToHex(dqsValue('#red-slider'), dqsValue('#green-slider'), dqsValue('#blue-slider'));
                pallete.textContent = colorValue;
                pallete.style.backgroundColor = colorValue;
                
                const sum = parseInt(dqsValue('#red-slider'))+ parseInt(dqsValue('#green-slider'))+ parseInt(dqsValue('#blue-slider'));
                pallete.style.color = sum > 382.5 ? "black" : "white";
            }
            else
            {
                pallete.textContent = "Eraser";
                pallete.style.backgroundColor = "#BBBBBB";
                pallete.style.color = "black";
            }

            if (callback)
            {
                callback();
            }
        }

        callbackWrapper();

        if (!eraser)
        {
            Slider.oninput = function() {
                SliderPreview.style.backgroundColor = GetColorFor(colorName, this.value);
                SliderText.textContent = this.value;
                localStorage[`pallete${localStorage.currentPallete}-${colorName[0]}`] = this.value;
                callbackWrapper();
            }
        }

    }
}