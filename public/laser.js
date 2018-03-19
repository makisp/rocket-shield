function Laser(shipPos, shipAngle, friendly) {
    this.pos = createVector(shipPos.x, shipPos.y);
    this.velocity = p5.Vector.fromAngle(shipAngle);
    this.velocity.mult(9);
    
    this.update = function() {
        if(!friendly) {
            this.pos.add(this.velocity);
        } else {
            shipPos.add(this.velocity);
        }
    }
    
    this.render = function() {
        push();
        strokeWeight(4);
        stroke("yellow");
        if(!friendly) {
            point(this.pos.x, this.pos.y);
        } else {
            push();
            stroke("lightgreen");
            point(shipPos.x, shipPos.y);;
            pop();
        }
        pop();
    }
    
    this.hit = function(comet) {
        if(!friendly) {
            var d = dist(this.pos.x, this.pos.y, comet.pos.x, comet.pos.y);
        } else {
            var d = dist(shipPos.x, shipPos.y, comet.pos.x, comet.pos.y);
        }
        if(d < comet.r+5) {
            score++;
            return true;
        } else {
            return false;
        }
    }
    
    this.energy = function() {
        if(!friendly) {
            if(dist(spaceship.pos.x, spaceship.pos.y, this.pos.x, this.pos.y) > 500) {
                return true;
            }
        } else {
            if(dist(shipPos.x, shipPos.y, this.pos.x, this.pos.y) > 500) {
                return true;
            }
        }
        return false;
    }
}