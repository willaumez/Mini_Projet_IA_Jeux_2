class Obstacle {
    constructor(x, y, r) {
      this.position = createVector(x, y);
      this.r = r;
      this.color = color(0, 255, 0);
    }
  
    show() {
      push();
      fill(this.color);
      stroke(0)
      strokeWeight(3);
      ellipse(this.position.x, this.position.y, this.r * 2);
      fill(0);
      ellipse(this.position.x, this.position.y, 10);
      pop();
    }
  }