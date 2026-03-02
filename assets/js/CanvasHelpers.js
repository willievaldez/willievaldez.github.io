let Canvas = null;
let Ctx = null;
let MouseState = 
{
    pos: {x: 0, y: 0},
    bPressed: false
}

function Initialize(canvasId, drawFn)
{
    Canvas = document.querySelector(`#${canvasId}`);
    Ctx = Canvas.getContext('2d');

    AddResizeListener();
    AddMouseListeners();

    function drawWrapper() {
        drawFn();
        window.requestAnimationFrame(drawWrapper);
    }
    window.requestAnimationFrame(drawWrapper);
}

function AddResizeListener()
{
    function resizeCanvas()
    {
        var W = Canvas.width, H = Canvas.height;
        let temp = Ctx.getImageData(0,0,W,H)
        Canvas.width = window.innerWidth * 0.8;
        Canvas.height = window.innerHeight * 0.8;
        Ctx.putImageData(temp,0,0);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

function AddMouseListeners()
{
    Canvas.addEventListener('mousemove', function(evt) {
        var rect = Canvas.getBoundingClientRect();
        let rectWidth = rect.right - rect.left;
        let rectHeight = rect.bottom - rect.top; 
        MouseState.pos = {
            x: (evt.clientX - rect.left) / rectWidth,
            y: (evt.clientY - rect.top) / rectHeight
        };
    }, false);
    
    Canvas.addEventListener('mousedown', function(evt) {
        MouseState.bPressed = true;
    }, false);
    
    Canvas.addEventListener('mouseup', function(evt) {
        MouseState.bPressed = false;
    }, false);
}

function DrawRect(size, fillStyle = null)
{
    if (fillStyle)
    {
        Ctx.fillStyle = fillStyle;
    }

    Ctx.fillRect(Math.round(MouseState.pos.x*Canvas.width)-(size/2),
                 Math.round(MouseState.pos.y*Canvas.height)-(size/2),
                 size, size);
}