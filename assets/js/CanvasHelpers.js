let Canvas = null;
let Ctx = null;
let drawFun = null;
let MouseState = 
{
    pos: {x: 0, y: 0},
    bPressed: false
}

function Initialize(inParams)
{
    const defaultParams = {canvasId: null, drawFn:null, width: 0.8, height: 0.8};
    const params = Object.assign(defaultParams, inParams)
    Canvas = document.querySelector(`#${params.canvasId}`);
    Ctx = Canvas.getContext('2d');

    AddResizeListener(params.width, params.height);
    AddMouseListeners();
    drawFn = params.drawFn;

    function drawWrapper() {
        if (drawFn)
        {
            drawFn();
        }
        window.requestAnimationFrame(drawWrapper);
    }
    window.requestAnimationFrame(drawWrapper);
}

function AddResizeListener(width, height)
{
    function resizeCanvas()
    {
        var W = Canvas.width, H = Canvas.height;
        let temp = Ctx.getImageData(0,0,W,H)
        Canvas.width = window.innerWidth * width;
        Canvas.height = window.innerHeight * height;
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
    
    Canvas.addEventListener('touchmove', function(evt) {
        MouseState.bPressed = true;
        var rect = Canvas.getBoundingClientRect();
        let rectWidth = rect.right - rect.left;
        let rectHeight = rect.bottom - rect.top; 
        for (const changedTouch of evt.changedTouches) {
            MouseState.pos = {
                x: (changedTouch.pageX - rect.left - window.scrollX) / rectWidth,
                y: (changedTouch.pageY - rect.top - window.scrollY) / rectHeight
            };

            if (drawFn)
            {
                drawFn();
            }
        }
        MouseState.bPressed = false;
    }, false);
    
    Canvas.addEventListener('mousedown', function(evt) {
        MouseState.bPressed = true;
    }, false);
    Canvas.addEventListener('touchstart', function(evt) {
        // MouseState.bPressed = true;
    }, false);
    
    Canvas.addEventListener('mouseup', function(evt) {
        MouseState.bPressed = false;
    }, false);
    Canvas.addEventListener('touchend', function(evt) {
        // MouseState.bPressed = false;
    }, false);
    
    Canvas.addEventListener('mouseleave', function(evt) {
        MouseState.bPressed = false;
    }, false);
    Canvas.addEventListener('touchcancel', function(evt) {
        // MouseState.bPressed = false;
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