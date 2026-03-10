let Canvas = null;
let Ctx = null;

const InitParams = {
    canvasId: null,
    drawFn: null,
    onResize: null,
    width: 0.8,
    widthType: "%",
    widthId: null,
    height: 0.8,
    heightType: "%",
    heightId: null,
    widthRatio: 0,
    heightRatio: 0,
    cellSize: 50,
    cellId: null,
    withStateCache: false
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
    Ctx = Canvas.getContext('2d', {willReadFrequently: InitParams.withStateCache});

    AddResizeListener();
    AddMouseListeners();

    if (InitParams.withStateCache)
    {
        SetupUndo();
    }

    function drawWrapper() {
        if (InitParams.drawFn)
        {
            InitParams.drawFn();
        }
        window.requestAnimationFrame(drawWrapper);
    }
    window.requestAnimationFrame(drawWrapper);
}

function Resize(inParams)
{
    if (inParams.widthType == "%" && inParams.width > 1.0)
    {
        return;
    }
    else if (inParams.widthType == "px" && inParams.width <= 1)
    {
        return;
    }

    if (inParams.heightType == "%" && inParams.height > 1.0)
    {
        return;
    }
    else if (inParams.heightType == "px" && inParams.height <= 1)
    {
        return;
    }

    Object.assign(InitParams, inParams);
    ResizeCanvas();
}

function ResizeCanvas()
{
    const tempImg = new Image();
    tempImg.src = Canvas.toDataURL();

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

    if (InitParams.heightRatio && InitParams.widthRatio)
    {
        const calculatedWidth = Canvas.height * InitParams.widthRatio / InitParams.heightRatio;
        const calculatedHeight = Canvas.width * InitParams.heightRatio / InitParams.widthRatio;
        if (Canvas.width > calculatedWidth)
        {
            Canvas.width = calculatedWidth;
        }
        else if (Canvas.height > calculatedHeight)
        {
            Canvas.height = calculatedHeight;
        }
    }

    if (InitParams.onResize)
    {
        InitParams.onResize();
    }
    else
    {
        tempImg.onload = ()=>{
            DrawImage({src: tempImg, x: 0, y: 0, canvasWidthRatio: 1.0, canvasHeightRatio: 1.0});
        };
    }
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
        if (MouseState.bPressed)
        {
            CacheState();
        }
        MouseState.bPressed = false;
    }, false);
    Canvas.addEventListener('touchend', function(evt) {
        if (MouseState.bPressed)
        {
            CacheState();
        }
        // MouseState.bPressed = false;
    }, false);
    
    Canvas.addEventListener('mouseleave', function(evt) {
        if (MouseState.bPressed)
        {
            CacheState();
        }
        MouseState.bPressed = false;
    }, false);
    Canvas.addEventListener('touchcancel', function(evt) {
        if (MouseState.bPressed)
        {
            CacheState();
        }
        // MouseState.bPressed = false;
    }, false);
}

const StateCache = [];
StateCache.length = 20;
let CurrState = -1;
function CacheState()
{
    if (!InitParams.withStateCache)
    {
        return;
    }

    if (++CurrState >= StateCache.length)
    {
        CurrState = 0;
    }
    StateCache[CurrState] = Ctx.getImageData(0,0,Canvas.width, H = Canvas.height);
}

function Undo()
{
    StateCache[CurrState] = null;
    if (--CurrState < 0)
    {
        CurrState = StateCache.length-1;
    }

    if (StateCache[CurrState])
    {
        Ctx.putImageData(StateCache[CurrState],0,0);
    }
    else
    {
        CacheState();
    }
}

function SetupUndo()
{
    CacheState();
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            Undo();
        }
    });
}

function DrawRect(inParams)
{
    const defaultParams = {fillStyle: null, size: 24, bUseGrid: false, xPos: null, yPos: null};
    const params = Object.assign(defaultParams, inParams);
    if (params.fillStyle)
    {
        Ctx.fillStyle = params.fillStyle;
    }

    if (!params.xPos)
    {
        params.xPos = MouseState.pos.x*Canvas.width;
        params.xPos -= params.bUseGrid ? xPos % params.size : params.size/2;
    }
    if (!params.yPos)
    {
        params.yPos = MouseState.pos.y*Canvas.height;
        params.yPos -= params.bUseGrid ? yPos % params.size : params.size/2;
    }


    Ctx.fillRect(Math.round(params.xPos), Math.round(params.yPos), params.size, params.size);
}

function DrawImage(inParams)
{
    const defaultParams = {src: null, x: 0, y: 0, centered: true, canvasWidthRatio: null, canvasHeightRatio: null};
    const params = Object.assign(defaultParams, inParams);

    // Account for inputted scale
    let dWidth = params.src.naturalWidth;
    let dHeight = params.src.naturalHeight;
    if (params.canvasWidthRatio)
    {
        dWidth = Canvas.width * params.canvasWidthRatio;
        if (!params.canvasHeightRatio)
        {
            dHeight *= (dWidth / params.src.naturalWidth);
        }
    }
    if (params.canvasHeightRatio)
    {
        dHeight = Canvas.height * params.canvasHeightRatio;
        if (!params.canvasWidthRatio)
        {
            dWidth *= (dHeight / params.src.naturalHeight);
        }
    }

    // Convert to screen space
    params.x *= Canvas.width;
    params.y *= Canvas.height;

    // Center if necessary
    if (params.centered)
    {
        params.x -= dWidth / 2.0;
        params.y -= dHeight / 2.0;
    }

    Ctx.drawImage(params.src, Math.round(params.x), Math.round(params.y), dWidth, dHeight);
}
