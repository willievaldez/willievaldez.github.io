function SetupColorSider(colorName, callback)
{
    const Slider = document.querySelector(`#${colorName}-slider`);
    Slider.oninput = function() {
        let color = null;
        if (colorName == "red")
        {
            color = `rgb(${this.value}, 0, 0)`;
        }
        else if (colorName == "green")
        {
            color = `rgb(0, ${this.value}, 0)`;
        }
        else if (colorName == "blue")
        {
            color = `rgb(0, 0, ${this.value})`;
        }
        document.querySelector(`#${colorName}-preview`).style.backgroundColor = color;
        document.querySelector(`#${colorName}-text`).textContent = `${this.value}`;
        callback();
    }
}