
const froggy = {
    state: "idle",
    start: {x: 0.225, y: 0.65},
    dest: {x: 0.0, y: 0.0},
    progress: 0.0,
    speed: 0.01,
    getPos: function() {
        if (this.state != "moving")
        {
            return this.start;
        }

        return {x: this.start.x + ((this.dest.x - this.start.x) * this.progress), y: this.start.y + ((this.dest.y - this.start.y) * this.progress)}
    },
    update: function() {
        if (this.state != "idle") {
            this.progress += this.speed;
        }
        if (this.progress > 1.0)
        {
            this.progress = 0.0;
            this.state = "idle";
        }

        DrawImage({src: document.getElementById("frog"), x: froggy.getPos().x, y: froggy.getPos().y, canvasWidthRatio: 0.1});
    }
};

const tongue = {
    // properties of tongue
    speed: 0.02,
    width: 0.01,
    color: "#99253C",
    offset: {x: 0.0375, y: -0.005},

    // vars used when moving
    state: "idle",
    rot: 0.0,
    len: 0.0,
    progress: 0,

    getSrc: function() {
        const src = froggy.getPos();
        return {x: src.x + this.offset.x, y: src.y + this.offset.y};
    },

    shoot: function() {
        if (this.state != "idle")
        {
            return;
        }

        this.progress = 0;
        this.state = "moving";

        const src = this.getSrc();
        let dir = {x: (MouseState.pos.x - src.x) * Canvas.width, y: (MouseState.pos.y - src.y) * Canvas.height};
        this.len = Math.sqrt(Math.pow(dir.x, 2) + Math.pow(dir.y, 2));
        this.rot = Math.atan(dir.y / dir.x);

        if (dir.x < 0)
        {
            this.rot += Math.PI;
        }
    },
    update: function() {
        if (this.state != "moving")
        {
            return;
        }

        const tongueLen = (++this.progress * this.speed) * this.len;
        const src = this.getSrc();
        DrawRect({fillStyle: this.color, width: tongueLen, height: this.width * Canvas.height, bUseGrid: false, xPos: src.x * Canvas.width, yPos: src.y * Canvas.height, canvasRelative: false, rot: this.rot});

        if (tongueLen >= this.len)
        {
            this.state = "idle"
        }
    }
}
