function Spaceship(friendX, friendY, friendH) {
    if(!friendX) {
        this.pos = createVector(windowWidth/2, -windowHeight);
        this.heading = 0;
    } else {
        this.pos = createVector(friendX, friendY);
        this.heading = friendH;
    }
    this.r = 15;
    this.rotation = 0;
    this.velocity = createVector(0, 0);
    this.isBoosting = false;
    
    this.boosting = function(b) {
        this.isBoosting = b;
    }
    
    this.update = function() {
        if (this.isBoosting) {
            this.boost();
        }
        this.pos.add(this.velocity);
        this.velocity.mult(0.95);
        if(!friendX) {
            coords = {
                shipX: this.pos.x,
                shipY: this.pos.y,
                shipH: this.heading
            }  
            socket.emit('ship', coords);
        }
    }
    
    this.boost = function() {
        push();
        var force = p5.Vector.fromAngle(this.heading);
        force.mult(0.4);
        this.velocity.add(force);
        stroke("white");
        fill("red");
        triangle(-this.r+10, this.r, 0, this.r+10, -this.r+20, this.r);
        pop();
    }
    
    this.render = function() {
        pop();
        push();
        fill(255);
        noStroke();
        if(!friendX) {
            displayScore();
        }
        pop();
        if(!friendX) {
            fill("#3D6BA3");
        } else {
            fill("yellow");
        }
        stroke(255);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.heading + PI/2);
        triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
        mouseVector = createVector(mouseX, mouseY);
        mouseVector.sub(this.pos.x, this.pos.y);
        this.setRotation(mouseVector.heading());
    }
    
    this.setRotation = function(a) {
        this.rotation = a;
    }
    
    this.turn = function() {
        this.heading = this.rotation;
    }
    
    this.edges = function() {
        if(this.pos.x > width + this.r) {
            this.pos.x = -this.r;
        } else if(this.pos.x < -this.r) {
            this.pos.x = width + this.r;
        }
        if(this.pos.y > height + this.r) {
            this.pos.y = -this.r;
        } else if(this.pos.y < -this.r) {
            this.pos.y = height + this.r;
        }
    }
    
    this.hit = function(comet) {
        var d = dist(this.pos.x, this.pos.y, comet.pos.x, comet.pos.y);
        if(d < comet.r+5) {
            return true;
        } else {
            return false;
        }
    }
}