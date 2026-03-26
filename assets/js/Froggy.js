
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
        this.tongue.update();
    },

    
    tongue: {
        // properties of tongue
        speed: 750,
        width: 0.01,
        color: "#99253C",
        offset: {x: 0.0375, y: -0.005},

        // vars used when moving
        state: "idle",
        dir: {x: 1.0, y: 0.0},
        rot: 0.0,
        len: 0.0,
        startTime: null,

        getSrc: function(bScreenSpace) {
            const src = froggy.getPos();
            if (bScreenSpace)
            {
                return ToScreenSpace(src.x + this.offset.x, src.y + this.offset.y);
            }
            else
            {
                return {x: src.x + this.offset.x, y: src.y + this.offset.y};
            }
        },

        shoot: function() {
            if (this.state != "idle")
            {
                return;
            }

            this.startTime = Date.now();
            this.state = "moving";

            const src = this.getSrc(false);
            this.dir = ToScreenSpace(MouseState.pos.x - src.x, MouseState.pos.y - src.y);
            this.len = Math.sqrt(Math.pow(this.dir.x, 2) + Math.pow(this.dir.y, 2));
            this.rot = Math.atan(this.dir.y / this.dir.x);

            // Normalize direction vector
            this.dir = {x: this.dir.x / this.len, y: this.dir.y / this.len};

            if (this.dir.x < 0)
            {
                this.rot += Math.PI;
            }
        },
        update: function() {
            if (this.state != "moving")
            {
                return;
            }

            const timeSpent = Date.now() - this.startTime;
            const tongueLen = (timeSpent * this.speed) / Canvas.width;
            const startScreenSpace = this.getSrc(true);
            DrawRect({fillStyle: this.color, width: tongueLen, height: YToScreenSpace(this.width), xPos: startScreenSpace.x, yPos: startScreenSpace.y, rot: this.rot});

            const tongueTip = {x: (startScreenSpace.x) + (this.dir.x * tongueLen), y: (startScreenSpace.y) + (this.dir.y * tongueLen)};
            // DrawRect({fillStyle: this.color, xPos: tongueTip.x, yPos: tongueTip.y, rot: this.rot});

            let i = flies.entities.length;
            while (i--)
            {
                const flyPos = flies.entities[i].pos;
                const sqDist = Math.pow(flyPos.x - (tongueTip.x / Canvas.width), 2) + Math.pow(flyPos.y - (tongueTip.y / Canvas.height), 2);
                if (sqDist < 0.005)
                {
                    flies.entities.splice(i, 1);
                    this.state = "idle"
                    flies.add(1, 0.2, 0.8, 0.1, 0.5);
                }
            }

            if (tongueLen >= this.len)
            {
                this.state = "idle"
            }
        }
    }
};

const flies = {
    entities: [],
    add: function(qty, xmin, xmax, ymin, ymax)
    {
        const xrange = xmax - xmin;
        const yrange = ymax - ymin;
        for (let i = 0; i < qty; i++)
        {
            const randx = (Math.random() * xrange) + xmin;
            const randy = (Math.random() * yrange) + ymin;

            this.entities.push({
                pos: {x: randx, y: randy}
            })
        }
    },
    update: function()
    {
        for (const fly of this.entities)
        {
            DrawImage({src: document.getElementById("fly"), x: fly.pos.x, y: fly.pos.y, canvasWidthRatio: 0.05});
        }
    }
};