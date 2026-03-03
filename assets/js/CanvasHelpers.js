let Canvas = null;
let Ctx = null;

const InitParams = {
    canvasId: null,
    drawFn: null,
    width: 0.8,
    widthType: "%",
    widthId: null,
    height: 0.8,
    heightType: "%",
    heightId: null,
    cellSize: 50,
    cellId: null
};

const MouseState = 
{
    pos: {x: 0, y: 0},
    bPressed: false
}

function Initialize(inParams)
{
    Object.assign(InitParams, inParams);
    Canvas = document.querySelector(`#${InitParams.canvasId}`);
    Ctx = Canvas.getContext('2d');

    AddResizeListener();
    AddMouseListeners();

    function drawWrapper() {
        if (InitParams.drawFn)
        {
            InitParams.drawFn();
        }
        window.requestAnimationFrame(drawWrapper);
    }
    window.requestAnimationFrame(drawWrapper);
}

function ResizeCanvas()
{
    var W = Canvas.width, H = Canvas.height;
    let temp = Ctx.getImageData(0,0,W,H);

    if (InitParams.widthType == "%")
    {
        Canvas.width = window.innerWidth * InitParams.width;
    }
    else if (InitParams.widthType == "px")
    {
        Canvas.width = InitParams.width;
    }

    if (InitParams.heightType == "%")
    {
        Canvas.height = window.innerHeight * InitParams.height;
    }
    else if (InitParams.heightType == "px")
    {
        Canvas.height = InitParams.height;
    }

    Ctx.putImageData(temp,0,0);
}

function AddResizeListener()
{
    window.addEventListener('resize', ResizeCanvas);
    ResizeCanvas();
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

            if (InitParams.drawFn)
            {
                InitParams.drawFn();
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

function DrawRect(inParams)
{
    const defaultParams = {fillStyle: null, size: 24, bUseGrid: false};
    const params = Object.assign(defaultParams, inParams);
    if (params.fillStyle)
    {
        Ctx.fillStyle = params.fillStyle;
    }

    let xPos = MouseState.pos.x*Canvas.width;
    let yPos = MouseState.pos.y*Canvas.height;

    if (params.bUseGrid)
    {
        xPos -= xPos % params.size;
        yPos -= yPos % params.size;
    }
    else
    {
        xPos -= params.size/2;
        yPos -= params.size/2;
    }

    Ctx.fillRect(Math.round(xPos), Math.round(yPos), params.size, params.size);
}