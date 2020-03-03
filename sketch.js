let flock;

function setup() {
   createCanvas(windowWidth, windowHeight);
   //createCanvas(windowWidth, windowHeight, WEBGL);
   frameRate(60);
   smooth();
   flock = new Flock(300);
   flock.init();
}

function draw() {
   background(51);

   // WEBGL only
   //translate(-width/2,-height/2,0);

   flock.calculateVelocity();
   flock.update(1 * deltaTime/1000);
   flock.draw();

}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
 }

function attractionFunction(distance, amount) {
   let x = distance;
   // Divider recommended to be close to group size
   let velocityMultiplier = 18 * log(x/400);
   return velocityMultiplier;
}

function velocityTowardsOther(baseBlob, targetBlob) {
   // Get vector which points to other blob
   let velocity = p5.Vector.sub(targetBlob.position, baseBlob.position);

   // Set vector magnitude with specified equation
   velocity.normalize();
   let distance = p5.Vector.dist(baseBlob.position, targetBlob.position);
   return velocity.mult(attractionFunction(distance));
}

function velocityAwayFromMouse(blob) {
   if (!(mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0)) {
      return createVector(0, 0);
   }
   let mousePosition = createVector(mouseX, mouseY);
   let velocityAwayFromMouse = p5.Vector.sub(blob.position, mousePosition);
   let distanceFromMouse = p5.Vector.dist(blob.position, mousePosition);
   return velocityAwayFromMouse.setMag(1/distanceFromMouse * 35000);
}

function velocityTowardsCenter(blob) {
   let centerPosition = createVector(width/2, height/2);
   let velocity = p5.Vector.sub(centerPosition, blob.position);
   let distance = p5.Vector.dist(centerPosition, blob.position);
   velocity.normalize();
   velocity.mult(distance/5);
   return velocity;
}

class Flock {
   constructor(size) {
      this.size = size;
      this.blobs = [];
   }

   init() {
      for (let i = 0; i < this.size; i++) {
         this.blobs.push(new Blob(random(width), random(height), 1));
      }
   }

   update(t) {
      for (let i = 0; i < this.size; i++) {
         this.blobs[i].update(t);
      }
   }

   draw() {
      push();
      noStroke();
      colorMode(HSB, 1);
      for (let i = 0; i < this.size; i++) {
         this.blobs[i].draw();
      }
      pop();
   }

   calculateVelocity() {
      for (let i = 0; i < this.size; i++) {
         let totalVelocity = createVector(0, 0);
         for (let j = 0; j < this.size; j++) {
            if (i != j) {
               totalVelocity.add(velocityTowardsOther(this.blobs[i], this.blobs[j]));
            }
         }
         totalVelocity.add(velocityTowardsCenter(this.blobs[i]));
         totalVelocity.limit(120);
         totalVelocity.add(velocityAwayFromMouse(this.blobs[i]));
         this.blobs[i].applyVelocity(totalVelocity);
      }
   }

}

class Blob {
   constructor(x, y, m) {
      this.position = createVector(x, y);
      this.velocity = createVector(0, 0);
   }

   update(t) {
      this.position.add(p5.Vector.mult(this.velocity, t));;
   }

   applyVelocity(velocity) {
      this.velocity = velocity;
   }

   draw() {
      fill(map(this.velocity.mag(), 0, 40, 0.7, 0.71), 1, 1);
      circle(this.position.x, this.position.y, 10);
   }
}

