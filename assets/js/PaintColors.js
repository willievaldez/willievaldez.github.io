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

function SetupColorSider(colorName, callback)
{
    const Slider = document.querySelector(`#${colorName}-slider`);
    const SliderPreview = document.querySelector(`#${colorName}-preview`);
    const SliderText = document.querySelector(`#${colorName}-text`);

    if (!localStorage[colorName])
    {
        localStorage[colorName] = 50;
    }

    SliderPreview.style.backgroundColor = GetColorFor(colorName, localStorage[colorName]);
    SliderText.textContent = `${localStorage[colorName]}`;
    Slider.value = localStorage[colorName];
    callback();

    Slider.oninput = function() {
        SliderPreview.style.backgroundColor = GetColorFor(colorName, this.value);
        SliderText.textContent = `${this.value}`;
        localStorage[colorName] = this.value;
        callback();
    }
}