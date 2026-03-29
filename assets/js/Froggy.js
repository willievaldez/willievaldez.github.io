
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
        speed: 0.001,
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

            const sound = document.getElementById("tongue-launch");
            sound.pause();
            sound.currentTime = 0;
            sound.play();

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
            const tongueLen = XToScreenSpace(timeSpent * this.speed);

            const startScreenSpace = this.getSrc(true);
            DrawRect({fillStyle: this.color, width: tongueLen, height: YToScreenSpace(this.width), xPos: startScreenSpace.x, yPos: startScreenSpace.y, rot: this.rot});

            const tongueTip = {x: (startScreenSpace.x) + (this.dir.x * tongueLen), y: (startScreenSpace.y) + (this.dir.y * tongueLen)};
            // DrawRect({fillStyle: this.color, xPos: tongueTip.x, yPos: tongueTip.y, rot: this.rot});

            let i = flies.entities.length;
            while (i--)
            {
                const flyPos = flies.entities[i].pos;
                const sqDist = Math.pow(flyPos.x - (tongueTip.x / Canvas.width), 2) + Math.pow(flyPos.y - (tongueTip.y / Canvas.height), 2);
                if (sqDist < 0.001)
                {
                    flies.entities.splice(i, 1);
                    this.state = "idle"
                    document.getElementById("tongue-hit").play();
                    flies.add(1);
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
    speed: 0.005,
    spawnArea: {ymin: 0.05, ymax: 0.45},
    entities: [],
    add: function(qty)
    {
        const yrange = this.spawnArea.ymax - this.spawnArea.ymin;
        for (let i = 0; i < qty; i++)
        {
            const randy = (Math.random() * yrange) + this.spawnArea.ymin;
            const dir = (Math.random() * this.speed * 2.0) - (this.speed);

            this.entities.push({
                dir: dir,
                pos: {x: dir > 0.0 ? 0.0 : 1.0, y: randy}
            })
        }
    },
    update: function()
    {
        let i = flies.entities.length;
        while (i--)
        {
            const fly = flies.entities[i];
            const halfSpeed = this.speed / 2.0;
            fly.pos.x += (Math.random() * this.speed) - (halfSpeed) + fly.dir;
            fly.pos.y += (Math.random() * halfSpeed) - (halfSpeed / 2.0);
            DrawImage({src: document.getElementById("fly"), x: fly.pos.x, y: fly.pos.y, canvasWidthRatio: 0.05});

            // Clean up off-screen flies
            if (fly.pos.x < 0.0 || fly.pos.x > 1.0)
            {
                flies.entities.splice(i, 1);
                flies.add(1);
            }
        }
    }
};