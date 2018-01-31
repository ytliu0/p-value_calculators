"use strict";

// require statFunctions.js and canvas.js
// make sure to include them in the html page

function init() {
   var df1 = 5;
   var df2 = 10;
   var F = 3;
   var p = 0.06556;
   document.getElementById("df1").value = df1;
   document.getElementById("df2").value = df2;
   document.getElementById("F").value = F;
   document.getElementById("p-value").value = p;
   document.getElementById("ptype1").checked = true;
   document.getElementById("ptype2").checked = false;
   document.getElementById("input").style.color = "black";
   document.getElementById("input").innerHTML = "F = "+F+",  df1 = "+df1+",  df2 = "+df2;
   document.getElementById("output").innerHTML = "Right-tail p-value is "+p;
   document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pf("+F+", "+df1+", "+df2+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  1-pf("+F+", "+df1+", "+df2+")";
   drawCurve(F,df1, df2, 1);
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
    PfromF_F(form);
  } else if (outputStr.indexOf("F-value") != -1) {
    FfromP_F(form);
  } else {
    var df1 = 5;
    var df2 = 10;
    var F = 3;
    document.getElementById("df1").value = df1;
    document.getElementById("df2").value = df2;
    document.getElementById("F").value = F;
    PfromF_F(form);
  }
}

function PfromF_F(form) {
  var df1 = parseInt(form.df1.value);
  var df2 = parseInt(form.df2.value);
  var F = parseFloat(form.F.value);

  // Sanity check
  if (!isFinite(df1) || df1<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom 1 must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df1.value = "";
    form.p_value.value = "";
    clearCanvas('Fcurve');
    return;
  }

  if (!isFinite(df2) || df2<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom 2 must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df2.value = "";
    form.p_value.value = "";
    clearCanvas('Fcurve');
    return;
  }

  if (df1 != parseFloat(form.df1.value)) {
    form.df1.value = df1;
  }
  if (df2 != parseFloat(form.df2.value)) {
    form.df2.value = df2;
  }

  if (!isFinite(F) || F < 0) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! F-value must be positive or 0.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.F.value = "";
    clearCanvas('Fcurve');
    return;
  }

  var ptype = 1;
  if (document.getElementById("ptype2").checked) {
    ptype = 2;
  }

  var p = pf(F,df1,df2,ptype);
  var pval = 1.0*p.toPrecision(4);
  form.p_value.value = pval;
  document.getElementById("input").style.color = "black";
  document.getElementById("input").innerHTML = "F = "+F+",  df1 = "+df1+",  df2 = "+df2;
  if (ptype==1) { 
    document.getElementById("output").innerHTML = "Right-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pf("+F+", "+df1+", "+df2+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  1-pf("+F+", "+df1+", "+df2+")";
  } else {
    document.getElementById("output").innerHTML = "Left-tail p-value is "+pval;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 pf("+F+", "+df1+", "+df2+")";
  }

  drawCurve(F, df1, df2, ptype);
}

function FfromP_F(form) {
  var df1 = parseInt(form.df1.value);
  var df2 = parseInt(form.df2.value);
  var p = parseFloat(form.p_value.value);

  // Sanity check
  if (!isFinite(df1) || df1<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom 1 must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df1.value = "";
    form.F.value = "";
    clearCanvas('Fcurve');
    return;
  }

  if (!isFinite(df2) || df2<1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! The degree of freedom 2 must be a positive integer.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.df2.value = "";
    form.F.value = "";
    clearCanvas('Fcurve');
    return;
  }

  if (df1 != parseFloat(form.df1.value)) {
    form.df1.value = df1;
  }

  if (df2 != parseFloat(form.df2.value)) {
    form.df2.value = df2;
  }

  if (!isFinite(p) || p < 0 || p>1) {
    var x = document.getElementById("input");
    x.style.color = "red";
    document.getElementById("input").innerHTML = "Invalid input! P-value must be between 0 and 1.";
    document.getElementById("output").innerHTML = "";
    document.getElementById("Rcommand").innerHTML = "";
    form.F.value = "";
    clearCanvas('Fcurve');
    return;
  }

  var ptype = 1;
  if (document.getElementById("ptype2").checked) {
    ptype = 2;
  }

  var F = qf(p,df1,df2,ptype);
  var Fval = 1.0*F.toPrecision(4);
  form.F.value = Fval;
  document.getElementById("input").style.color = "black";
  document.getElementById("output").innerHTML = "F-value is "+Fval;
  if (ptype==1) {
    document.getElementById("input").innerHTML = "Right-tail p-value is "+p+",  df1 = "+df1+",  df2 = "+df2;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qf("+p+", "+df1+", "+df2+", lower.tail=FALSE) \xa0 \xa0 \xa0  or \xa0 \xa0 \xa0  qf(1-"+p+", "+df1+", "+df2+")";
  } else {
    document.getElementById("input").innerHTML = "Left-tail p-value is "+p+",  df1 = "+df1+",  df2 = "+df2;
    document.getElementById("Rcommand").innerHTML = "R command: \xa0 \xa0 \xa0 qf("+p+", "+df1+", "+df2+")";
  }

  drawCurve(F, df1, df2, ptype);
}

// Draw F curve
function drawCurve(F,d1,d2, ptype) {
  var Canvas = document.getElementById('Fcurve'); 
  var Ctx = null;
  var Width = Canvas.width;
  var Height = Canvas.height;
  var sd = 2.0;
  if (d2 > 4) {
    sd = Math.sqrt(2*(d1+d2-2)/d1/(d2-4))*d2/(d2-2);
  }
  var meanX;  
  if (d2>2) { 
    meanX=d2/(d2-2.0); 
  } else {
    meanX = 1.0;
  }
  var maxX = meanX + 5*sd;
  var minX = Math.max(0, meanX - 5*sd);
  var maxY = 1.1;
  if (d1==1) {maxY = 2;}
  if (F > maxX) {
    maxX = F*1.1;
    if (d1>2) {
       maxX = Math.min(maxX, meanX+10*sd); 
    } else {
       maxX = Math.min(maxX, 100);
       maxY = Math.max(fF(F,d1,d2)*100, maxY); 
       if (d1==2) {maxY = Math.min(1.1,maxY); }
    }
  }
  var deltaX = Math.floor((maxX-minX)/6);
  deltaX = Math.max(deltaX,1);
  var minY = -maxY*0.1;
  if (Canvas.getContext) {
    // Set up the canvas:
    Ctx = Canvas.getContext('2d');
    Ctx.clearRect(0,0,Width,Height);
    // Draw:
    // setup graph parameters 
    var gpar = {"minX":minX, "maxX":maxX, "minY":minY, "maxY":maxY, 
                "Width":Width, "Height":Height};
    // Draw:
    var messages = {message:"F-value out of plotting range!", 
                    x1Message: 0, y1Message: 0.5*maxY,
                    x2Message: 0, y2Message: 0};
    if (F > maxX) { messages.x1Message = minX + 0.6*(maxX-minX);}
    if (F < minX) { messages.x1Message = minX + 3*(maxX-minX)/Width;}
    var fillColor = "#87CEEB";
    var fun = function(x) {return fF(x,d1,d2);}
    if (ptype==1) {
        ShadeCurve(Ctx, fun, F,0, 2, fillColor, messages, gpar);
    } else {
        ShadeCurve(Ctx, fun, F,0, 1, fillColor, messages, gpar);
    }
    DrawAxes(Ctx, gpar, deltaX, true);
    RenderFunction(Ctx, fun, gpar);
  } else {
    // Do nothing.
  }
}

// F density function (normalized so that max is 1 when d1 > 1)
// For d1=1, returns 1/sqrt(x) * (1+x/d2)^(-(1+d2)/2)
var fF = function(x,d1,d2) {
  if (x <= 0) {
    if (d1 > 2) {
       return 0;
    } else if (d1==2) {
       return 1;
    } else {
       return 1e300;
    }
  } 

  if (d1<3) {
    return Math.exp((0.5*d1-1)*Math.log(x) 
                      - 0.5*(d1+d2)*Math.log(1+d1*1.0/d2*x));
  }

  var xmode = d2*(d1-2.0)/d1/(d2+2);
  var z = x/xmode;
  var y = (1+1.0*d1*x/d2)/(1+1.0*d1*xmode/d2);
  return Math.exp((0.5*d1-1)*Math.log(z) - 0.5*(d1+d2)*Math.log(y));
}