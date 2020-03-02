let friendlyPlane;
let enemyPlane;

function setup() {
   createCanvas(800, 850);

   //#region Sliders
   amplitudeSlider = createSlider(1, 300, 200, 0);
   amplitudeSlider.position(10, 10);
   amplitudeSlider.style('width', '160px');

   speedSlider = createSlider(0, 5, 1, 0);
   speedSlider.position(10, 50);
   speedSlider.style('width', '160px');

   offsetSlider = createSlider(0, 200, 50, 0);
   offsetSlider.position(10, 90);
   offsetSlider.style('width', '160px');

   lagSlider = createSlider(0, TWO_PI, 0.78, 0);
   lagSlider.position(10, 130);
   lagSlider.style('width', '160px');
   //#endregion Sliders

   enemyPlane = new Plane(width / 2, 350, color(255, 0, 0));
   friendlyPlane = new Plane(width / 2, 350, color(0, 255, 0));
}

function draw() {
   background(240);

   let time = millis() / 1000;

   //#region Sliders
   let amplitude = amplitudeSlider.value();
   let speed = speedSlider.value();
   let offsetX = offsetSlider.value();
   let lag = lagSlider.value();

   textSize(20);
   text(round(amplitude), 180, 30);
   text(round(speed), 180, 70);
   text(round(offsetX), 180, 110);
   text(nfc(lag, 2), 180, 150);

   friendlyPlane.setAmplitude(amplitude);
   friendlyPlane.setSpeed(speed);

   enemyPlane.setAmplitude(amplitude);
   enemyPlane.setSpeed(speed);
   enemyPlane.setOffsetX(width / 2 + offsetX);
   enemyPlane.setLag(lag);
   //#endregion Sliders

   friendlyPlane.move(time);
   friendlyPlane.display();

   enemyPlane.move(time);
   enemyPlane.display();

   push();
   stroke(255);
   rect(50, 600, 750-50, 800-600);
   pop();
   plotEquation(50, 750, 600, 800, distancePerTime, 0, TWO_PI, 100, color(0));
   plotEquation(50, 750, 600, 800, anglePerTime, 0, TWO_PI, 100, color(255, 0, 0));

   lineBetweenPlanes(friendlyPlane, enemyPlane);
   text("Distance: " + round(distance(friendlyPlane, enemyPlane)), width - 200, 30);
   push();
   stroke(255, 0, 0);
   fill(255, 0, 0);
   text("Angle: " + nfc(abs(degrees(angleDifference(enemyPlane, friendlyPlane))), 2), width - 200, 60);
   pop();

}

class Plane {
   constructor(offsetX, offsetY, c) {
      this.x = 0;
      this.y = 0;
      this.angle = 0;
      this.lag = 0;

      this.offsetX = offsetX;
      this.offsetY = offsetY;

      this.speed = 1;
      this.amplitude = 10;

      this.r = 5;
      this.c = c; // Color
   }

   move(t) {
      this.x = this.offsetX + sin(t * this.speed - this.lag) * this.amplitude;
      this.y = this.offsetY + cos(t * this.speed - this.lag) * this.amplitude;
      this.angle = (t * this.speed - this.lag) % TWO_PI;
   }

   display() {
      push();
      fill(0, 0);
      stroke(this.c);
      strokeWeight(0.5);
      circle(this.offsetX, this.offsetY, this.amplitude * 2)
      pop();

      drawArrow(createVector(this.x, this.y), createVector(this.offsetX-this.x, this.offsetY-this.y), this.c);

      push();
      fill(this.c);
      strokeWeight(1);
      translate(this.x, this.y);
      rotate(-this.angle + HALF_PI);
      triangle(0, -this.r * 2, -this.r, this.r * 2, this.r, this.r * 2);
      pop();
   }

   setAmplitude(A) {
      this.amplitude = A;
   }

   setSpeed(v) {
      this.speed = v;
   }

   setOffsetX(offsetX) {
      this.offsetX = offsetX;
   }

   setLag(lag) {
      this.lag = lag;
   }


}

function lineBetweenPlanes(plane1, plane2) {
   push();
   stroke(0);
   line(plane1.x, plane1.y, plane2.x, plane2.y);
   pop();
}

function distance(plane1, plane2) {
   return sqrt((plane1.x - plane2.x) ** 2 + (plane1.y - plane2.y) ** 2);
}

function angleDifference(p1, p2) {
   let v1 = createVector(p1.y - p1.offsetY, -(p1.x - p1.offsetX)); // Inverted to get tangent vector
   let v2 = createVector(p2.x - p1.x, p2.y - p1.y);

   /*   DEBUG
   let v0 = createVector(p1.x, p1.y);
   drawArrow(v0, v1, 'red');
   drawArrow(v0, v2, 'blue');
   */

   return v1.angleBetween(v2);
}


function drawArrow(base, vec, myColor) {  // DEBUG
   push();
   stroke(myColor);
   strokeWeight(2);
   fill(myColor);
   translate(base.x, base.y);
   line(0, 0, vec.x, vec.y);
   rotate(vec.heading());
   let arrowSize = 7;
   translate(vec.mag() - arrowSize, 0);
   triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
   pop();
}

//#region EXPERIMENTAL
function plotEquation(left, right, top, bottom, equation, start, end, steps, c) {
   let values = []
   let xvalues = []
   let step = (end - start) / steps;
   for (let i = 0; i <= steps; i++) {
      values[i] = round(equation(i*step+start)*10000)/10000;
      xvalues[i] = i*step+start;
   }

   let largest = max(values);
   let smallest = min(values);


   for(let i = 0; i < values.length; i++) {
      values[i] = map(values[i], smallest, largest, bottom, top);
      xvalues[i] = map(xvalues[i], start, end, left, right);
   }
   push();
   stroke(c);
   for(let i = 0; i < values.length-1; i++) {
      line(xvalues[i], values[i], xvalues[i+1], values[i+1]);
   }
   if (largest == smallest) {
      line(left, (bottom+top)/2, right, (bottom+top)/2);
   }
   pop();
}

function distancePerTime(t) {
   let p1 = Object.assign( Object.create( Object.getPrototypeOf(friendlyPlane)), friendlyPlane);
   let p2 = Object.assign( Object.create( Object.getPrototypeOf(enemyPlane)), enemyPlane);
   p1.move(t);
   p2.move(t);
   return distance(p1, p2);
}

function anglePerTime(t) {
   let p1 = Object.assign( Object.create( Object.getPrototypeOf(friendlyPlane)), friendlyPlane);
   let p2 = Object.assign( Object.create( Object.getPrototypeOf(enemyPlane)), enemyPlane);
   p1.move(t);
   p2.move(t);
   return abs(angleDifference(p1, p2));
}
//#endregion EXPERIMENTAL