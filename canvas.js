"use strict";

// This js file provides functions to control the plot in canvas

// Clear canvas
function clearCanvas(canvasID) {
  var Canvas = document.getElementById(canvasID);
  var Ctx = Canvas.getContext('2d');
  Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
}

// Returns the canvas x-coordinate of a mathematical x-coordinate:
// p is an object with 3 properties: minX, rangeX and Width,
// where minX is the minimum value of x, rangeX = maxX-minX, and 
// Width is the width of the graph (in pixels)
function XC(x, p) {
  return (x - p.minX)/p.rangeX * p.Width;
}

// Returns the canvas y-coordinate of a mathematical y-coordinate:
// p is an object with 3 properties: minY, rangeY and Height,
// where minY is the minimum value of y, rangeY = maxY-minY, and 
// Height is the height of the graph (in pixels)
function YC(y, p) {
  return p.Height - (y - p.minY)/p.rangeY * p.Height;
}

// DrawAxes draws the X ad Y axes.
// gpar is an object with the properties minX, maxX, minY, maxY, Width, 
// and Height.
// adjust: true/false variable. If true, the x-position of the x-ticks 
//          near minX will be shifted slightly to the right (used in 
//          pchisq.js and pf.js)
function DrawAxes(Ctx, gpar, deltaX, adjust) {
 // setup parameters for the function XC and YC
 var xpar = {"minX":gpar.minX, "rangeX":gpar.maxX-gpar.minX, "Width":gpar.Width};
 var ypar = {"minY":gpar.minY, "rangeY":gpar.maxY-gpar.minY, "Height":gpar.Height};

 Ctx.save() ;
 Ctx.lineWidth = 1 ;
 Ctx.strokeStyle = "rgb(128,128,128)";
 Ctx.font="14px Arial";
 Ctx.fillStyle = "black";
    
 // Y axis
 if (gpar.minX <=0) {
     Ctx.beginPath();
     Ctx.moveTo(XC(0, xpar),YC(gpar.minY, ypar));
     Ctx.lineTo(XC(0, xpar),YC(gpar.maxY, ypar));
     Ctx.stroke();
 }

 // X axis
 Ctx.beginPath();
 Ctx.moveTo(XC(gpar.minX, xpar),YC(0, ypar));
 Ctx.lineTo(XC(gpar.maxX, xpar),YC(0, ypar));
 Ctx.stroke();

 // X tick marks
 var istart = Math.floor(gpar.minX/deltaX);
 var imax = gpar.maxX/deltaX;
 for (var i = istart; i < imax ; i++) {
  Ctx.beginPath();
  var x = i*deltaX; 
  if (x >= gpar.minX) {
    Ctx.moveTo(XC(x, xpar),YC(0, ypar)-5);
    Ctx.lineTo(XC(x, xpar),YC(0, ypar)+5);
    Ctx.stroke();  
    if (!adjust) {
       Ctx.fillText(x, XC(x, xpar)-3, YC(0, ypar)+20); 
    } else {
       if (i > 0) {
          if (x < 0.05*gpar.minX + 0.95*gpar.maxX) {
             Ctx.fillText(x, XC(x, xpar)-3, YC(0, ypar)+20);
          }
        } else {
          Ctx.fillText(x, XC(x, xpar)+1, YC(0, ypar)+20);
        } 
    }
  }
 }
 Ctx.restore();
}

// When rendering, XSTEP determines the horizontal distance between points:

// RenderFunction(f) renders the input funtion f on the canvas.
// gpar is an object with the properties minX, maxX, minY, maxY, Width, 
// and Height.
function RenderFunction(Ctx, f, gpar) {
 // setup parameters for the function XC and YC
 var xpar = {"minX":gpar.minX, "rangeX":gpar.maxX-gpar.minX, "Width":gpar.Width};
 var ypar = {"minY":gpar.minY, "rangeY":gpar.maxY-gpar.minY, "Height":gpar.Height};
  var XSTEP = (gpar.maxX-gpar.minX)/gpar.Width;
  var first = true;

  Ctx.beginPath();
  for (var x = gpar.minX; x <= gpar.maxX; x += XSTEP) {
   var y = f(x);
   if (first) {
    if (y <= gpar.maxY) {
        Ctx.moveTo(XC(x, xpar),YC(y, ypar));
        first = false;
    }
   } else {
    Ctx.lineTo(XC(x, xpar),YC(y, ypar));
   }
  }
  Ctx.strokeStyle = "black"
  Ctx.stroke();
}

// Shade the Region under the curve defined by the function f(x)
// gpar is an object with the properties minX, maxX, minY, maxY, Width, 
// and Height.
// fillColor: a string (e.g. '#87CEEB', 'black',...) that 
//            defines the shade color.
// type: an integer between 1 and 3 that determines what region to be shaded
// type = 1: region under f(x) for x < x1 is shaded and a vertical line is drawn at x=x1
// type = 2: region under f(x) for x > x1 is shaded and a vertical line is drawn at x=x2
// type = 3: region under f(x) for x1 < x < x2 is shaded and two vertical lines are drawn at x=x1 and x=x2.
// Note that the variable x2 is used only for type=3
// 'messages' is an object with the properties message, x1Message, y1Message, 
//      x2Message, and y2Message. It is used to print texts on the canvas 
//      at (x1Message, y1Message) if x1 is out of plotting range and 
//      at (x2Message, y2Message) if x2 is out of plotting range (for type=3).
function ShadeCurve(Ctx, f, x1,x2, type, fillColor, messages, gpar) {
 // setup parameters for the function XC and YC
 var xpar = {"minX":gpar.minX, "rangeX":gpar.maxX-gpar.minX, "Width":gpar.Width};
 var ypar = {"minY":gpar.minY, "rangeY":gpar.maxY-gpar.minY, "Height":gpar.Height};

 // Draw filled 100-side polygon 
 var npoly = 100;
 var delta, x, y, i, xstart, xend;
    
 // Shade region under f(x) for xstart < x < xend
 // First calculate xstart and xend
 if (type==1) {
     xend = Math.min(x1, gpar.maxX);
     xstart = Math.min(gpar.minX, x1);
 } else if (type==2) {
     xstart = Math.max(x1, gpar.minX);
     xend = Math.max(gpar.maxX, x1);
 } else {
     xstart = Math.max(x1, gpar.minX);
     xstart = Math.min(xstart, x2);
     xend = Math.min(x2, gpar.maxX);
 }
    
 // Shade region if it's in the plotting range
 var eps = 1e-10;
 if (xstart > gpar.minX-eps && xend < gpar.maxX+eps) {
     delta = (xend-xstart)/npoly;
     Ctx.beginPath();
     Ctx.moveTo(XC(xstart, xpar),YC(0, ypar)); 
     for (i=0; i<npoly+1; i++) {
         x = xstart + i*delta;
         y = Math.min(f(x),gpar.maxY);
         Ctx.lineTo(XC(x, xpar),YC(y, ypar));
     }
     Ctx.lineTo(XC(xend, xpar),YC(0, ypar));
     Ctx.closePath();
     Ctx.fillStyle = fillColor; 
     Ctx.fill();
 }
     
 // draw a vertical line at x=x1 if x1 is in the plotting range
 if (x1 >= gpar.minX && x1 <= gpar.maxX) {
    Ctx.beginPath();
    Ctx.moveTo(XC(x1, xpar),YC(0, ypar));
    Ctx.lineTo(XC(x1, xpar),YC(gpar.maxY, ypar));
    Ctx.strokeStyle = "black"
    Ctx.stroke();
 } else {
   Ctx.font="12px Arial";
   Ctx.fillStyle = "black";
   Ctx.fillText(messages.message, XC(messages.x1Message, xpar)-3, YC(messages.y1Message, ypar)+20);
 }
    
 if (type==3) {
    // draw a vertical line at x=x2 if x1 is in the plotting range 
     if (x2 >= gpar.minX && x2 <= gpar.maxX) {
        Ctx.beginPath();
        Ctx.moveTo(XC(x2, xpar),YC(0, ypar));
        Ctx.lineTo(XC(x2, xpar),YC(gpar.maxY, ypar));
        Ctx.strokeStyle = "black"
        Ctx.stroke();
     } else {
       Ctx.font="12px Arial";
       Ctx.fillStyle = "black";
       Ctx.fillText(messages.message, XC(messages.x2Message, xpar)-3, YC(messages.y2Message, ypar)+20);
     }
 }
 
}