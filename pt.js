"use strict";

function init() {
   var n = 4;
   var t = 1.5;
   var mt = -1.5;
   var p = 0.104;
   document.getElementById("df").value = n;
   document.getElementById("t").value = t;
   document.getElementById("p-value").value = p;
   document.getElementById("ptype0").checked = false;
   document.getElementById("ptype1").checked = true;
   document.getElementById("ptype2").checked = false;
   document.getElementById("ptype3").checked = false;
   document.getElementById("input").style.color = "black";
   document.getElementById("input").innerHTML = "t = "+t+",  df = "+n;
   document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
   document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pt("+mt+", "+n+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  pt("+t+", "+n+", lower.tail=FALSE)";
   drawCurve(t,n, 1);
}

function changePtype(form,type) {
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
    Pfromt_t(form);
  } else if (outputStr.indexOf("t-value") != -1) {
    tfromP_t(form);
  } else {
    var n = 4;
    var t = 1.5;
    document.getElementById("df").value = n;
    document.getElementById("t").value = t;
    Pfromt_t(form);
  }
}

function Pfromt_t(form) {
  var n = parseInt(form.df.value);
  var t = parseFloat(form.t.value);

  // Sanity check
  if (!isFinite(n) || n<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df.value = "";
    form.p_value.value = "";
    clearCanvas('tcurve');
    return;
  }
  if (n != parseFloat(form.df.value)) {
    form.df.value = n;
  }
  if (!isFinite(t)) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! You entered a non-numerical value for t.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.t.value = "";
    clearCanvas('tcurve');
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
  
  var abst = Math.abs(t);
  var mt= -t;
  if (ptype>1) { mt = -abst;}
  var p = pt(t,n,ptype);
  var pval = 1.0*p.toPrecision(4);
  form.p_value.value = pval;
  document.getElementById("input").style.color = "black";
  document.getElementById("input").innerHTML = "t = "+t+",  df = "+n;
  if (ptype==0) {
    document.getElementById("output").innerHTML = "Left-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pt("+t+", "+n+")";
  } else if (ptype==1) { 
    document.getElementById("output").innerHTML = "Right-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pt("+mt+", "+n+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  pt("+t+", "+n+", lower.tail=FALSE)";
  } else if (ptype==2) {
    document.getElementById("output").innerHTML = "Two-tails p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 2*pt("+mt+", "+n+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  2*pt("+abst+", "+n+", lower.tail=FALSE)";
  } else {
    document.getElementById("output").innerHTML = "Middle area is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 1-2*pt("+mt+", "+n+")";
  }

  drawCurve(t, n, ptype);
}

function tfromP_t(form) {
  var n = parseInt(form.df.value);
  var p = parseFloat(form.p_value.value);

  // Sanity check
  if (!isFinite(n) || n<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df.value = "";
    clearCanvas('tcurve');
    return;
  }
  if (n != parseFloat(form.df.value)) {
    form.df.value = n;
  }
  if (!isFinite(p) || p < 0 || p>1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! P-value must be between 0 and 1.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.t.value = "";
    clearCanvas('tcurve');
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
    
  var t = qt(p,n,ptype);
  var tval = 1.0*t.toPrecision(4);
  form.t.value = tval;
  document.getElementById("input").style.color = "black";
  document.getElementById("output").innerHTML = "t-value is "+tval;
  if (ptype==0) {
    document.getElementById("input").innerHTML = "Left-tail p-value is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qt("+p+", "+n+")";
  } else if (ptype==1) {
    document.getElementById("input").innerHTML = "Right-tail p-value is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qt("+p+", "+n+") \xa0 \xa0 \xa0 or \xa0 \xa0 \xa0 qt("+p+", "+n+", lower.tail=FALSE)";
  } else if (ptype==2) {
    document.getElementById("input").innerHTML = "Two-tails p-value is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qt("+p+"/2, "+n+") \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0 qt("+p+"/2, "+n+", lower.tail=FALSE)";
  } else {
    document.getElementById("input").innerHTML = "Middle area is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 -qt( (1-"+p+")/2, "+n+")";
  }

  drawCurve(t, n, ptype);
}


// Draw t curve
function drawCurve(t,n, ptype) {
  var Canvas = document.getElementById('tcurve'); 
  var Ctx = null;
  var Width = Canvas.width;
  var Height = Canvas.height;
  var sd;
  if (n > 2) {
    sd = Math.sqrt(1.0*n/(n-2));
  } else {
    sd = 2.0;
  }
  var maxX = 3.2*sd;
  var deltaX = 1.0;
  var abst = Math.abs(t);
  if (abst > 3) {
    maxX = abst*1.1;
    maxX = Math.min(maxX, 15);
    deltaX = Math.floor(maxX/3);
  }
  var minX = -maxX;
  var maxY = 1.1;
  var minY = -0.15;
  
  // t density function
  var ft = function(x) { return Math.pow(1.0+x*x/n, -0.5*(n+1));}
    
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext('2d');
    Ctx.clearRect(0,0,Width,Height);
    // setup graph parameters 
    var gpar = {"minX":minX, "maxX":maxX, "minY":minY, "maxY":maxY, 
                "Width":Width, "Height":Height};
    // Draw:
    var messages = {message:"t value out of plotting range!", 
                    x1Message: 5, y1Message: 0.5,
                    x2Message: 5, y2Message: 0.5};
    var fillColor = "#87CEEB";
    if (ptype==0) {
        if (t < 0) {messages.x1Message = -14;}
        ShadeCurve(Ctx, ft, t,0, 1, fillColor, messages, gpar);
    } else if (ptype==1) {
        if (t < 0) {messages.x1Message = -14;}
        ShadeCurve(Ctx, ft, t,0, 2, fillColor, messages, gpar);
    } else if (ptype==2) {
        ShadeCurve(Ctx, ft,  abst,0, 2, fillColor, messages, gpar);
        messages.x1Message = -14;
        ShadeCurve(Ctx, ft, -abst,0, 1, fillColor, messages, gpar);
    } else {
        messages.x1Message = -14;
        ShadeCurve(Ctx, ft, -abst,abst, 3, fillColor, messages, gpar);
    }
    DrawAxes(Ctx, gpar, deltaX, false);
    RenderFunction(Ctx, ft, gpar);
  } else {
    // Do nothing.
  }
}