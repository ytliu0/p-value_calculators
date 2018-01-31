"use strict";

// require statFunctions.js and canvas.js 
// make sure to include them in the html page

function init() {
  var z = 1.5;
  var mz=-1.5;
  var p = 0.06681;
  document.getElementById("Z-score").value = z;
  document.getElementById("p-value").value = p;
  document.getElementById("ptype0").checked = false;
  document.getElementById("ptype1").checked = true;
  document.getElementById("ptype2").checked = false;
  document.getElementById("ptype3").checked = false;
  document.getElementById("input").innerHTML = "Z-score: "+z;
  document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
  document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  pnorm("+mz+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  pnorm("+z+", lower.tail=FALSE)";
  drawCurve(z, 1);
}

function changePtype(form, type) {
  // var ptype = form.ptype.value;
  var ptype = parseInt(type);
  if (ptype==0) {
    document.getElementById("ptype0").checked = true;
    document.getElementById("ptype1").checked = false;
    document.getElementById("ptype2").checked = false;
    document.getElementById("ptype3").checked = false;  
    form.pbutton.value = "Compute p-value";
    document.getElementById("pdisplay").innerHTML = "p-value";
  } else if (ptype==1) {
    document.getElementById("ptype0").checked = false;
    document.getElementById("ptype1").checked = true;
    document.getElementById("ptype2").checked = false;
    document.getElementById("ptype3").checked = false;
    form.pbutton.value = "Compute p-value";
    document.getElementById("pdisplay").innerHTML = "p-value";
  } else if (ptype==2) {
    document.getElementById("ptype0").checked = false;
    document.getElementById("ptype1").checked = false;
    document.getElementById("ptype2").checked = true;
    document.getElementById("ptype3").checked = false;
    form.pbutton.value = "Compute p-value";
    document.getElementById("pdisplay").innerHTML = "p-value";
  } else {
    document.getElementById("ptype0").checked = false;
    document.getElementById("ptype1").checked = false;
    document.getElementById("ptype2").checked = false;
    document.getElementById("ptype3").checked = true;
    form.pbutton.value = "Compute middle area";
    document.getElementById("pdisplay").innerHTML = "middle area";
  }
  var outputStr = document.getElementById("output").innerHTML;
  if (outputStr.indexOf("p-value") != -1 || outputStr.indexOf("Middle area") != -1) {
    PfromZ_normal(form);
  } else if (outputStr.indexOf("Z-score") != -1) {
    ZfromP_normal(form);
  } else {
    document.getElementById("input").style.color = "black";
    var z = 1.5;
    form.z_score.value = z;
    var mz = -1.5;
    var absz = 1.5;
    document.getElementById("input").innerHTML = "Z-score: "+z;
    if (ptype==0) {
      var p = 0.9332;
      form.p_value.value = p;
      document.getElementById("output").innerHTML = "Left-tail p-value is "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  pnorm("+z+")";
    } else if (ptype==1) {
      var p = 0.06681;
      form.p_value.value = p;
      document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  pnorm("+mz+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  pnorm("+z+", lower.tail=FALSE)";
    } else if (ptype==2) {
      var p = 0.1336;
      form.p_value.value = p;
      document.getElementById("output").innerHTML = "Two-tails p-value is "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  2*pnorm(-"+absz+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  2*pnorm("+absz+", lower.tail=FALSE)";
    } else {
      var p = 0.8664;
      form.p_value.value = p;
      document.getElementById("output").innerHTML = "Two-tails p-value is "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  1-2*pnorm(-"+absz+")";
    }
    drawCurve(z, ptype);
  }
}

function PfromZ_normal(form) {
  var z = parseFloat(form.z_score.value); 
 
  // sanity check
  if (isNaN(z)) {
    var x = document.getElementById("input");
    x.style.color = "red";
    x.innerHTML = "Invalid input! You entered a non-numerical value for the Z-score!";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.p_value.value = "";
    clearCanvas('normalcurve');
    return;
  }

  var ptype;
  if (document.getElementById("ptype0").checked) {
    ptype = 0;
  } else if (document.getElementById("ptype1").checked) {
    ptype = 1;
  } else if (document.getElementById("ptype2").checked) {
    ptype = 2;
  } else {
    ptype = 3;
  }
  var mz = -z; 
  var absz = Math.abs(z);
  var p;
  if (ptype==0) {
    p = 1.0*pnorm(-z).toPrecision(4);
  } else if (ptype==1) {
    p = 1.0*pnorm(z).toPrecision(4);
  } else if (ptype==2) {
    p = 2.0*pnorm(absz);
    p = 1.0*p.toPrecision(4);
  } else {
    p = 1.0 - 2.0*pnorm(absz);
    p = 1.0*p.toPrecision(4);
  }
  
  // set the p-value in the input box
  form.p_value.value = p;

  // output result
  document.getElementById("input").style.color = "black";
  document.getElementById("input").innerHTML = "Z-score: "+z;
  if (ptype==0) {
    document.getElementById("output").innerHTML = "Left-tail p-value is "+p;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  pnorm("+z+")";
  } else if (ptype==1) {
    document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  pnorm("+mz+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  pnorm("+z+", lower.tail=FALSE)";
  } else if (ptype==2) {
    document.getElementById("output").innerHTML = "Two-tails p-value is "+p;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  2*pnorm(-"+absz+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  2*pnorm("+absz+", lower.tail=FALSE)";
  } else {
    document.getElementById("output").innerHTML = "Middle area is "+p;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0  1-2*pnorm(-"+absz+")";  
  }
  drawCurve(z, ptype);
}

function ZfromP_normal(form) {
    var p = parseFloat(form.p_value.value);

    // sanity check
    if (isNaN(p) || p>1 || p<0) {
      var x = document.getElementById("input");
      x.style.color = "red";
      x.innerHTML = "Invalid input! The p-value must be between 0 and 1.";
      document.getElementById("output").innerHTML = "";
      document.getElementById("Rcommand").innerHTML = "";
      form.z_score.value = "";
      clearCanvas('normalcurve');
      return;
    }

    var ptype;
    if (document.getElementById("ptype0").checked) {
      ptype = 0;
    } else if (document.getElementById("ptype1").checked) {
      ptype = 1;
    } else if (document.getElementById("ptype2").checked) {
      ptype = 2;
    } else {
      ptype = 3;
    }
    
    var z;
    if (ptype==0) {
      z = -qnorm(p)
    } else if (ptype==1) {
      z = qnorm(p);
    } else if (ptype==2) {
      z = qnorm(0.5*p);
    } else {
      z = qnorm(0.5*(1.0-p))
    }
    var zval = z.toPrecision(4);

    // Check if z is infinity
    var zplot = z;
    if (!isFinite(z)) {
      if (p < 0.5) {
        zval = "Infinity";
        zplot = 1e300;
      } else {
        zval = "-Infinity";
        zplot = -1e300;
      }
    }

    // Change the Z-score input value
    form.z_score.value = zval;

    // Output message and result
    document.getElementById("input").style.color = "black";
    document.getElementById("output").innerHTML = "Z-score is "+zval;
    if (ptype==0) {
      document.getElementById("input").innerHTML = "Left-tail p-value: "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qnorm("+p+")";
    } else if (ptype==1) {
      document.getElementById("input").innerHTML = "Right-tail p-value: "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qnorm("+p+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0 qnorm("+p+", lower.tail=FALSE)";
    } else if (ptype==2) {
      document.getElementById("input").innerHTML = "Two-tails p-value: "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qnorm("+p+"/2) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0 qnorm("+p+"/2, lower.tail=FALSE)";
    } else {
      document.getElementById("input").innerHTML = "Middle area: "+p;
      document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qnorm( (1-"+p+")/2 )";
    }
    drawCurve(zplot, ptype);
}

// Draw normal curve
function drawCurve(z, ptype) {
  var Canvas = document.getElementById('normalcurve'); 
  var Ctx = null;
  var Width = Canvas.width;
  var Height = Canvas.height;
  var maxX = 3.2;
  var deltaX = 1;
  var absz = Math.abs(z);
  if (absz > 3) {
    maxX = absz*1.1;
    maxX = Math.min(maxX, 10);
    deltaX = Math.floor(maxX/3);
  }
  var minX = -maxX;
  var maxY = 1.1;
  var minY = -0.2;
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext('2d');
    Ctx.clearRect(0,0,Width,Height);
    // setup graph parameters 
    var gpar = {"minX":minX, "maxX":maxX, "minY":minY, "maxY":maxY, 
                "Width":Width, "Height":Height};
    // Draw:
    var messages = {message:"Z-score out of plotting range!", 
                    x1Message: 3, y1Message: 0.5,
                    x2Message: 3, y2Message: 0.5};
    var fillColor = "#87CEEB";
    if (ptype==0) {
        if (z < 0) {messages.x1Message = -9;}
        ShadeCurve(Ctx, fgauss, z,0, 1, fillColor, messages, gpar);
    } else if (ptype==1) {
        if (z < 0) {messages.x1Message = -9;}
        ShadeCurve(Ctx, fgauss, z,0, 2, fillColor, messages, gpar);
    } else if (ptype==2) {
        ShadeCurve(Ctx, fgauss,  absz,0, 2, fillColor, messages, gpar);
        messages.x1Message = -9;
        ShadeCurve(Ctx, fgauss, -absz,0, 1, fillColor, messages, gpar);
    } else {
        messages.x1Message = -9;
        ShadeCurve(Ctx, fgauss, -absz,absz, 3, fillColor, messages, gpar);
    }
    DrawAxes(Ctx, gpar, deltaX, false);
    RenderFunction(Ctx, fgauss, gpar);
  } else {
    // Do nothing.
  }
}

// Gaussian function exp(-x^2/2)
var fgauss = function(x) {
  return Math.exp(-x*x*0.5);
} 