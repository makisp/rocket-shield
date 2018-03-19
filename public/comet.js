function Comet(pos, r, comX, comY, comR, comVelocity, comSides, comOffset) {
    var posRandomWidth = random(width);
    var posHeight = -80;
    if(pos){
        this.pos = pos;
        if(r > 60) {
            this.r = random(26, 50);
        } else if(r > 25) {
            this.r = random(15, 25);
        }
        this.velocity = new p5.Vector(random(-0.4, 0.4),random(0.2, random(1, 2.2)));
        this.sides = floor(random(10, 20));
        this.offset = [];
        for(var i = 0;i <this.sides;i++) {
            this.offset[i] = random(-10, 10);
        }
    } else if(comX) {
        this.pos = createVector(comX, comY);
        this.r = comR;
        this.velocity = new p5.Vector(comVelocity.x, comVelocity.y);
        this.sides = comSides;
        this.offset = comOffset;
    } else{
        this.pos = createVector(posRandomWidth, posHeight);
        this.r = random(20, 80);
        this.velocity = new p5.Vector(random(-0.4, 0.4),random(0.2, random(1, 2.2)));
        this.sides = floor(random(10, 20));
        this.offset = [];
        for(var i = 0;i <this.sides;i++) {
            this.offset[i] = random(-10, 10);
        }
    }
    
    if(!comX) {
        if(pos) {
            cometInfo = {
                cometPosX: this.pos.x,
                cometPosY: this.pos.y,
                cometR: this.r,
                cometVelocity: this.velocity,
                cometSides: this.sides,
                cometOffset: this.offset,
                id: userID
            };
        } else {
            cometInfo = {
                cometPosX: posRandomWidth,
                cometPosY: posHeight,
                cometR: this.r,
                cometVelocity: this.velocity,
                cometSides: this.sides,
                cometOffset: this.offset,
                id: userID
            };
        }
        socket.emit('comet', cometInfo);
    }
    this.colorRed = 99;
    this.colorGreen = 99;
    this.colorBlue = 99;
    
    this.render = function() {
        pop();
        push();
        if(this.pos) {
            translate(this.pos.x, this.pos.y);
            beginShape();
            fill(this.colorRed, this.colorGreen, this.colorBlue);
            for(var i = 0;i < this.sides;i++) {
                var angle = map(i, 0, this.sides, 0, TWO_PI);
                var x = (this.r + this.offset[i]) * cos(angle);
                var y = (this.r + this.offset[i]) * sin(angle);
                vertex(x, y);
            }
            endShape(CLOSE);
            pop();
        }
    }
    
    this.update = function() {
        this.pos.add(this.velocity);
    }
    
    this.edges = function() {
        if(this.pos.x > width + this.r) {
            this.pos.x = random(width);
            this.pos.y = -80;
            return true;
        } else if(this.pos.x < -this.r) {
            this.pos.x = random(width);
            this.pos.y = -80;
            return true;
        }
        if(this.pos.y > height + this.r) {
            displayMenuLost();
            noLoop();
        }
        return false;
    }
    
    this.divide = function() {
        var newComet = [];
        newComet[0] = new Comet(this.pos, this.r);
        return newComet;
    }
    
    this.burnout = function() {
        var dToEarth = dist(this.pos.x, this.pos.y, windowWidth/2, windowHeight);
        return (dToEarth < 300);
    }
    pop();
}