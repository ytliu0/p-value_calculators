"use strict";

// require statFunctions.js and canvas.js
// make sure to include them in the html page

function init() {
   var n = 4;
   var chi2 = 6;
   var p = 0.1991;
   document.getElementById("df").value = n;
   document.getElementById("Chisq").value = chi2;
   document.getElementById("p-value").value = p;
   document.getElementById("ptype1").checked = true;
   document.getElementById("ptype2").checked = false;
   document.getElementById("input").style.color = "black";
   document.getElementById("input").innerHTML = "Chi-square = "+chi2+",  df = "+n;
   document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
   document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pchisq("+chi2+", "+n+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  1-pchisq("+chi2+", "+n+")";
   drawCurve(chi2,n, 1);
}

function changePtype(form,type) {
  var ptype = parseInt(type);
  if (ptype==1) {
    document.getElementById("ptype1").checked = true;
    document.getElementById("ptype2").checked = false;
  } else{
    document.getElementById("ptype1").checked = false;
    document.getElementById("ptype2").checked = true;
  }
  
  var outputStr = document.getElementById("output").innerHTML;
  if (outputStr.indexOf("p-value") != -1) {
    PfromX2_chisq(form);
  } else if (outputStr.indexOf("Chi-square") != -1) {
    X2fromP_chisq(form);
  } else {
    var n = 4;
    var chi2 = 6;
    document.getElementById("df").value = n;
    document.getElementById("Chisq").value = chi2;
    PfromX2_chisq(form);
  }
}

function PfromX2_chisq(form) {
  var n = parseInt(form.df.value);
  var chi2 = parseFloat(form.Chisq.value);

  // Sanity check
  if (!isFinite(n) || n<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df.value = "";
    form.p_value.value = "";
    clearCanvas('chisqcurve');
    return;
  }
  if (n != parseFloat(form.df.value)) {
    form.df.value = n;
  }
  if (!isFinite(chi2) || chi2 < 0) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! Chi-square must be positive or 0.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.Chisq.value = "";
    clearCanvas('chisqcurve');
    return;
  }

  var ptype = 1;
  if (document.getElementById("ptype2").checked) {
    ptype = 2;
  }

  var p = pchisq(chi2,n,ptype);
  var pval = 1.0*p.toPrecision(4);
  form.p_value.value = pval;
  document.getElementById("input").style.color = "black";
  document.getElementById("input").innerHTML = "Chi-square = "+chi2+",  df = "+n;
  if (ptype==1) { 
    document.getElementById("output").innerHTML = "Right-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pchisq("+chi2+", "+n+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  1-pchisq("+chi2+", "+n+")";
  } else {
    document.getElementById("output").innerHTML = "Left-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pchisq("+chi2+", "+n+")";
  }

  drawCurve(chi2, n, ptype);
}

function X2fromP_chisq(form) {
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
    form.Chisq.value = "";
    clearCanvas('chisqcurve');
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
    form.Chisq.value = "";
    clearCanvas('chisqcurve');
    return;
  }

  var ptype = 1;
  if (document.getElementById("ptype2").checked) {
    ptype = 2;
  }

  var chi2 = qchisq(p,n,ptype);
  var chi2val = 1.0*chi2.toPrecision(4);
  form.Chisq.value = chi2val;
  document.getElementById("input").style.color = "black";
  document.getElementById("output").innerHTML = "Chi-square is "+chi2val;
  if (ptype==1) {
    document.getElementById("input").innerHTML = "Right-tail p-value is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qchisq("+p+", "+n+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  qchisq(1-"+p+", "+n+")";
  } else {
    document.getElementById("input").innerHTML = "Left-tail p-value is "+p+",  df = "+n;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qchisq("+p+", "+n+")";
  }

  drawCurve(chi2, n, ptype);
}

// Draw chi-square curve
function drawCurve(chi2,n, ptype) {
  var Canvas = document.getElementById('chisqcurve'); 
  var Ctx = null;
  var Width = Canvas.width;
  var Height = Canvas.height;
  var sd = Math.sqrt(2.0*n);
  var maxX = n + 5*sd;
  if (chi2 > maxX) {
    maxX = chi2*1.1;
    maxX = Math.min(maxX, n+10*sd);
  }
  var minX = Math.max(0, n - 5*sd);
  var deltaX = Math.floor((maxX-minX)/6);
  var maxY = 0.55;
  if (n > 2) {
    // for n>=2, max occures at chi2 = n-2
    maxY = 1.1*fchisq(n-2,n);
  }
  var minY = -maxY*0.1;
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext('2d');
    Ctx.clearRect(0,0,Width,Height);
    // setup graph parameters 
    var gpar = {"minX":minX, "maxX":maxX, "minY":minY, "maxY":maxY, 
                "Width":Width, "Height":Height};
    // Draw:
    var messages = {message:"Chi-square out of plotting range!", 
                    x1Message: 0, y1Message: 0.5*maxY,
                    x2Message: 0, y2Message: 0};
    if (chi2 > maxX) { messages.x1Message = minX + 0.6*(maxX-minX);}
    if (chi2 < minX) { messages.x1Message = minX + 3*(maxX-minX)/Width;}
    var fillColor = "#87CEEB";
    var fun = function(x) {return fchisq(x,n);}
    if (ptype==1) {
        ShadeCurve(Ctx, fun, chi2,0, 2, fillColor, messages, gpar);
    } else {
        ShadeCurve(Ctx, fun, chi2,0, 1, fillColor, messages, gpar);
    }
    DrawAxes(Ctx, gpar, deltaX, true);
    RenderFunction(Ctx, fun, gpar);
  } else {
    // Do nothing.
  }
}

// Chi-square density function
var fchisq = function(x,n) {
  if (x <= 0) {
    if (n > 2) {
       return 0;
    } else if (n==2) {
       return 0.5;
    } else {
       return 1e300;
    }
  } else {
   var gln = gamnln(n);
   var tmp = Math.exp( (0.5*n-1)*Math.log(x) - 0.5*x - 0.5*n*Math.LN2 - gln );
   return tmp;
  }
}