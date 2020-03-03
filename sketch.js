let flock;

function setup() {
   createCanvas(1280, 720);
   frameRate(60);

   flock = new Flock(40);
   flock.init();
}

function draw() {
   background(51);
   flock.calculateForce();
   flock.update(3 * deltaTime/1000);
   flock.draw();
}

function forceFunction(distance) {
   let x = distance;
   let forceMultiplier = (0.1*x-3)**3;
   if (!(forceMultiplier < 100)) {
      return 100;
   }
   return forceMultiplier;
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
      for (let i = 0; i < this.size; i++) {
         this.blobs[i].draw();
      }
   }

   calculateForce() {
      for (let i = 0; i < this.size; i++) {
         let totalForce = createVector(0, 0);
         for (let j = 0; j < this.size; j++) {
            if (i != j) {
               let distance = p5.Vector.dist(this.blobs[i].position, this.blobs[j].position);
               let force = p5.Vector.sub(this.blobs[j].position, this.blobs[i].position);
               force.normalize();
               force.mult(forceFunction(distance));
               totalForce.add(force);
            }
         }
         this.blobs[i].applyForce(totalForce);
      }
   }
}

class Blob {
   constructor(x, y, m) {
      this.position = createVector(x, y);
      this.velocity = createVector(0, 0);
      this.accleration = createVector(0, 0);
      this.mass = m;
   }

   update(t) {
      this.velocity.add(p5.Vector.mult(this.accleration, t));
      this.position.add(p5.Vector.mult(this.velocity, t));;
   }

   applyForce(force) {
      this.accleration = force.div(this.mass);
   }

   draw() {
      push();
      circle(this.position.x, this.position.y, 10);
      pop();
   }
}

