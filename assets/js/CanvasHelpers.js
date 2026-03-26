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
    widthRatio: 0,
    heightRatio: 0,
    cellSize: 50,
    cellId: null,
    withStateCache: false,
    customCursor: null,
    onClick: null
};

const MouseState = 
{
    pos: {x: 0, y: 0},
    bPressed: false,
    bTouch: false
}

const CanvasButtons = {};

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

    let lastTick = Date.now();
    function drawWrapper() {
        if (InitParams.drawFn)
        {
            const currTick = Date.now();
            InitParams.drawFn(currTick - lastTick);
            lastTick = currTick;

            for (let buttonName in CanvasButtons)
            {
                const {dWidth, dHeight} = TransformWidthHeight(CanvasButtons[buttonName]);
                const {x, y} = TransformPosition(CanvasButtons[buttonName], dWidth, dHeight);
                const mousePos = TransformPosition(MouseState.pos);

                if (mousePos.x > x && mousePos.x - x < dWidth && mousePos.y > y && mousePos.y - y < dHeight)
                {
                    Ctx.filter = "contrast(1.4)";
                }
                
                DrawImage(CanvasButtons[buttonName]);
                Ctx.filter = "";
            }

            if (InitParams.customCursor && !MouseState.bTouch)
            {
                InitParams.customCursor.x = MouseState.pos.x;
                InitParams.customCursor.y = MouseState.pos.y;
                DrawImage(InitParams.customCursor);
            }
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
    let newWidth = InitParams.width;
    if (InitParams.widthType == "%")
    {
        newWidth = window.innerWidth * InitParams.width;
    }

    let newHeight = InitParams.height;
    if (InitParams.heightType == "%")
    {
        newHeight = window.innerHeight * InitParams.height;
    }

    if (InitParams.heightRatio && InitParams.widthRatio)
    {
        const calculatedWidth = newHeight * InitParams.widthRatio / InitParams.heightRatio;
        const calculatedHeight = newWidth * InitParams.heightRatio / InitParams.widthRatio;
        if (newWidth > calculatedWidth)
        {
            newWidth = calculatedWidth;
        }
        else if (newHeight > calculatedHeight)
        {
            newHeight = calculatedHeight;
        }
    }

    if (Canvas.width != newWidth || Canvas.height != newHeight)
    {
        const tempImg = new Image();
        tempImg.src = Canvas.toDataURL();

        Canvas.width = newWidth;
        Canvas.height = newHeight;

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
        MouseState.bTouch = false;
    }, false);
    
    Canvas.addEventListener('touchmove', function(evt) {
        var rect = Canvas.getBoundingClientRect();
        let rectWidth = rect.right - rect.left;
        let rectHeight = rect.bottom - rect.top; 
        for (const changedTouch of evt.changedTouches) {
            MouseState.pos = {
                x: (changedTouch.pageX - rect.left - window.scrollX) / rectWidth,
                y: (changedTouch.pageY - rect.top - window.scrollY) / rectHeight
            };
            break;
        }
        MouseState.bPressed = true;
        MouseState.bTouch = true;
    }, false);
    
    Canvas.addEventListener('mousedown', function(evt) {
        MouseState.bPressed = true;
        MouseState.bTouch = false;
    }, false);
    Canvas.addEventListener('touchstart', function(evt) {
        event.preventDefault();
        
        var rect = Canvas.getBoundingClientRect();
        let rectWidth = rect.right - rect.left;
        let rectHeight = rect.bottom - rect.top; 
        for (const changedTouch of evt.changedTouches) {
            MouseState.pos = {
                x: (changedTouch.pageX - rect.left - window.scrollX) / rectWidth,
                y: (changedTouch.pageY - rect.top - window.scrollY) / rectHeight
            };
            break;
        }
        MouseState.bPressed = true;
        MouseState.bTouch = true;
    }, false);

    function EventEnd(bTouch)
    {
        if (MouseState.bPressed)
        {
            CacheState();

            for (let buttonName in CanvasButtons)
            {
                const {dWidth, dHeight} = TransformWidthHeight(CanvasButtons[buttonName]);
                const {x, y} = TransformPosition(CanvasButtons[buttonName], dWidth, dHeight);
                const mousePos = TransformPosition(MouseState.pos);

                if (mousePos.x > x && mousePos.x - x < dWidth && mousePos.y > y && mousePos.y - y < dHeight)
                {
                    if (MouseState.bPressed && CanvasButtons[buttonName].onclick)
                    {
                        CanvasButtons[buttonName].onclick();
                    }
                }
            }

            if (InitParams.onClick)
            {
                InitParams.onClick();
            }
        }
        MouseState.bPressed = false;
        MouseState.bTouch = bTouch;
    }
    
    Canvas.addEventListener('mouseup', function(evt) {
        EventEnd(false);
    }, false);
    Canvas.addEventListener('mouseleave', function(evt) {
        EventEnd(false);
    }, false);
    Canvas.addEventListener('touchend', function(evt) {
        EventEnd(true);
    }, false);
    Canvas.addEventListener('touchcancel', function(evt) {
        EventEnd(true);
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

function AddButton(buttonName, inParams, onclickFn = null)
{
    const defaultParams = {src: null, x: 0, y: 0, centered: true, canvasWidthRatio: null, canvasHeightRatio: null, onclick: onclickFn};
    const params = Object.assign(defaultParams, inParams);
    CanvasButtons[buttonName] = params;
}

function RemoveButton(buttonName)
{
    delete CanvasButtons[buttonName];
}

function DrawRect(inParams)
{
    const defaultParams = {fillStyle: null, width: 24, height: 24, bUseGrid: false, xPos: null, yPos: null, rot: null, canvasRelative: false};
    const params = Object.assign(defaultParams, inParams);
    if (params.canvasRelative)
    {
        params.width *= Canvas.width;
        params.height *= Canvas.width; // Use width instead (drawing a square should be square)
        params.xPos *= Canvas.width;
        params.yPos *= Canvas.height;
    }

    if (params.xPos == null)
    {
        params.xPos = XToScreenSpace(MouseState.pos.x);
        params.xPos -= params.bUseGrid ? params.xPos % params.width : params.width/2;
    }
    if (params.yPos == null)
    {
        params.yPos = YToScreenSpace(MouseState.pos.y);
        params.yPos -= params.bUseGrid ? params.yPos % params.height : params.height/2;
    }

    Ctx.resetTransform();
    Ctx.translate(Math.round(params.xPos), Math.round(params.yPos));
    if (params.rot)
    {
        Ctx.rotate(params.rot);
    }

    if (params.fillStyle != "clear")
    {
        if (params.fillStyle)
        {
            Ctx.fillStyle = params.fillStyle;
        }

        Ctx.fillRect(0, 0, params.width, params.height);
    }
    else
    {
        Ctx.clearRect(0, 0, params.width, params.height);
    }
    Ctx.resetTransform();
}

function TransformWidthHeight(params)
{
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

    return {dWidth, dHeight};
}

function XToScreenSpace(x)
{
    return x * Canvas.width;
}

function YToScreenSpace(y)
{
    return y * Canvas.height;
}

function ToScreenSpace(x, y)
{
    return {x: XToScreenSpace(x), y: YToScreenSpace(y)}
}

function TransformPosition(params, dWidth, dHeight)
{
    // Convert to screen space
    const pos = ToScreenSpace(params.x, params.y);

    // Center if necessary
    if (params.centered)
    {
        pos.x -= dWidth / 2.0;
        pos.y -= dHeight / 2.0;
    }

    return pos;
}

function DrawImage(inParams)
{
    const defaultParams = {src: null, x: 0, y: 0, centered: true, canvasWidthRatio: null, canvasHeightRatio: null};
    const params = Object.assign(defaultParams, inParams);

    const {dWidth, dHeight} = TransformWidthHeight(params);
    const {x, y} = TransformPosition(params, dWidth, dHeight);

    Ctx.resetTransform();
    Ctx.drawImage(params.src, Math.round(x), Math.round(y), dWidth, dHeight);
}
