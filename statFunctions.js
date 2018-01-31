"use strict";

//========================================================================
// This js file contains functions to compute 
//  * the standard normal distribution CDF: pnorm()
//  * the chi-square distribution CDF: pchisq()
//  * the t-ditribution CDF: pt()
//  * the F-distribution CDF: pf()
//  * the inverse of the above CDFs: qnorm(), qchisq(), qt(), qf()
//  
// Several auxiliary functions are needed (n, m are positive integers)
//  * bisection(): find the root of f(x)=0 using the method of bisection 
//                   (used to calculate the inverse of the CDFs)
//  * ln(Gamma(n/2)):  gamnln()
//  * incomplete gamma function P(n/2,x): gammp()
//  * incomplete gamma function Q(n/2,x): gammq()
//  * incomplete beta function I_x(n/2,m/2): betai()
//========================================================================

// Find the root of f(x)=0 using the method of bisection.
// f: function with one argument.
// x1 and x2 are real numbers such that x1 < x2 and f(x1)*f(x2) < 0.
// Warning: won't check if conditions about x1 and x2 are satisfied.
// They bracket the root, and are updated inside the function. 
// releps sets the relative accuracy of the root: the relative accuracy 
//         condition is satisfied if (x2-x1) < releps*|x|
// abseps sets the absolute accuracy of the root: the absolute accuracy condition
//         is satisfied if (x2-x1) < abseps or |f(x)| < abseps
// The function returns x when the relative accuracy condition OR the absolute 
//         accuracy condition is satisfied.
function bisection(f, x1,x2, releps, abseps) {
    var sign = function(z) {
        if (z > 0) {
            return 1;
        } else if (z < 0) {
            return -1;
        } else {
            return 0;
        }
    }
    
    var f1 = sign(f(x1));
    var f2 = sign(f(x2));
    var x = 0.5*(x1+x2);
    var fx = f(x);
    while(x2-x1 > abseps && x2-x1 > releps*Math.abs(x) && Math.abs(fx) > abseps) {
        if (fx*f1 > 0) {
            x1 = x;
            f1 = sign(fx);
        } else {
            x2 = x;
            f2 = sign(fx);
        }
        x = 0.5*(x1+x2);
        fx = f(x);
    }
    return x;
}

// p-value for normal distribution: equivalent to R's pnorm(-z):
// pnorm(z) = 1-F_{normal}(z), where F_{normal} is the cdf of the 
//   normal distribution.
// This function calculates the p-value with a relative error < 1.2e-7
function pnorm(z) {
  var x = Math.SQRT1_2*Math.abs(z);
  
  // compute erfc(x) using an approximation formula (max rel error = 1.2e-7) 
  // see https://en.wikipedia.org/wiki/Error_function#Numerical_approximation
  var t = 1.0/(1+0.5*x);
  var t2 = t*t;
  var t3 = t2*t; 
  var t4 = t2*t2;
  var t5 = t2*t3; 
  var t6 = t3*t3; 
  var t7 = t3*t4;
  var t8 = t4*t4;
  var t9 = t4*t5;
  var tau = -x*x - 1.26551223 + 1.00002368*t + 0.37409196*t2 + 0.09678418*t3 - 0.18628806*t4 + 0.27886807*t5 - 1.13520398*t6 + 1.48851587*t7 - 0.82215223*t8 + 0.17087277*t9;

  var p = 0.5*t*Math.exp(tau);

  if (z < 0) {
     p = 1-p;
  }

  return p;
}

// inverse of pnorm
// z from right-tail p: same as R's qnorm(p, lower.tail=FALSE)
// Use bisection to find z.
// Relative accuracy are set by the parameter eps
function qnorm(p) {
  if (p==0.5) {
     return 0;
  }

  if (p < 1e-300 || p > 1-3e-16) {
    return 1/0;
  }

  // Set relative accuracy parameter 
  var eps = 1.e-6;
  
  var pval = p;
  if (p > 0.5) {
     pval = 1-p;
  }

  // Start bisection search...
  // Set the upper and lower bound of z according to the inequalities
  // of erfc function described in 
  // https://en.wikipedia.org/wiki/Error_function#Approximation_with_elementary_functions :
  // erfc(x) \leq exp(-x^2)  for x>0, and 
  // erfc(x) \geq sqrt(2e/pi) sqrt(b-1)/b exp(-b x^2)  for x>0 and b>1 
  // The lower bound below comes from setting b=2.
  // Upper bound is multiplied by a safety factor 1.01; 
  // lower bound is multiplied by a safety factor 0.99.
  var sqrt_2pioe = 1.520346901066281;
  var min_arg = 2*pval*sqrt_2pioe;
  var minz = 0.0;
  if (min_arg < 1.0) {
     minz = 0.99*Math.sqrt( -Math.log(min_arg) );
  }
  var maxz = 1.01*Math.sqrt( -2*Math.log(2*pval) );
  var fun = function(z) {return pnorm(z) - pval;}
  var z = bisection(fun, minz,maxz, eps, 0);
  if (p > 0.5) {z = -z;}
  return z;
}

// Returns ln(Gamma(n/2)) for n=1,2,...
// Warning: won't check the argument
function gamnln(n) {
  // Tabulated values of ln(Gamma(n/2)) for n<201
  var lg = [0.5723649429247001, 0, -0.1207822376352452, 0, 0.2846828704729192, 0.6931471805599453, 1.200973602347074, 1.791759469228055, 2.453736570842442, 3.178053830347946, 3.957813967618717, 4.787491742782046, 5.662562059857142, 6.579251212010101, 7.534364236758733, 8.525161361065415, 9.549267257300997, 10.60460290274525, 11.68933342079727, 12.80182748008147, 13.94062521940376, 15.10441257307552, 16.29200047656724, 17.50230784587389, 18.73434751193645, 19.98721449566188, 21.2600761562447, 22.55216385312342, 23.86276584168909, 25.19122118273868, 26.53691449111561, 27.89927138384089, 29.27775451504082, 30.67186010608068, 32.08111489594736, 33.50507345013689, 34.94331577687682, 36.39544520803305, 37.86108650896109, 39.3398841871995, 40.8315009745308, 42.33561646075349, 43.85192586067515, 45.3801388984769, 46.91997879580877, 48.47118135183522, 50.03349410501914, 51.60667556776437, 53.19049452616927, 54.78472939811231, 56.38916764371993, 58.00360522298051, 59.62784609588432, 61.26170176100199, 62.9049908288765, 64.55753862700632, 66.21917683354901, 67.88974313718154, 69.56908092082364, 71.257038967168, 72.9534711841694, 74.65823634883016, 76.37119786778275, 78.09222355331531, 79.82118541361436, 81.55795945611503, 83.30242550295004, 85.05446701758153, 86.81397094178108, 88.58082754219767, 90.35493026581838, 92.13617560368709, 93.92446296229978, 95.71969454214322, 97.52177522288821, 99.33061245478741, 101.1461161558646, 102.9681986145138, 104.7967743971583, 106.6317602606435, 108.4730750690654, 110.3206397147574, 112.1743770431779, 114.0342117814617, 115.9000704704145, 117.7718813997451, 119.6495745463449, 121.5330815154387, 123.4223354844396, 125.3172711493569, 127.2178246736118, 129.1239336391272, 131.0355369995686, 132.9525750356163, 134.8749893121619, 136.8027226373264, 138.7357190232026, 140.6739236482343, 142.617282821146, 144.5657439463449, 146.5192554907206, 148.477766951773, 150.4412288270019, 152.4095925844974, 154.3828106346716, 156.3608363030788, 158.3436238042692, 160.3311282166309, 162.3233054581712, 164.3201122631952, 166.3215061598404, 168.3274454484277, 170.3378891805928, 172.3527971391628, 174.3721298187452, 176.3958484069973, 178.4239147665485, 180.4562914175438, 182.4929415207863, 184.5338288614495, 186.5789178333379, 188.6281734236716, 190.6815611983747, 192.7390472878449, 194.8005983731871, 196.86618167289, 198.9357649299295, 201.0093163992815, 203.0868048358281, 205.1681994826412, 207.2534700596299, 209.3425867525368, 211.435520202271, 213.5322414945632, 215.6327221499328, 217.7369341139542, 219.8448497478113, 221.9564418191303, 224.0716834930795, 226.1905483237276, 228.3130102456502, 230.4390435657769, 232.5686229554685, 234.7017234428182, 236.8383204051684, 238.9783895618343, 241.1219069670290, 243.2688490029827, 245.4191923732478, 247.5729140961868, 249.7299914986334, 251.8904022097232, 254.0541241548883, 256.2211355500095, 258.3914148957209, 260.5649409718632, 262.7416928320802, 264.9216497985528, 267.1047914568685, 269.2910976510198, 271.4805484785288, 273.6731242856937, 275.8688056629533, 278.0675734403662, 280.2694086832001, 282.4742926876305, 284.6822069765408, 286.893133295427, 289.1070536083976, 291.3239500942703, 293.5438051427607, 295.7666013507606, 297.9923215187034, 300.2209486470141, 302.4524659326413, 304.6868567656687, 306.9241047260048, 309.1641935801469, 311.4071072780187, 313.652829949879, 315.9013459032995, 318.1526396202093, 320.4066957540055, 322.6634991267262, 324.9230347262869, 327.1852877037753, 329.4502433708053, 331.7178871969285, 333.9882048070999, 336.2611819791985, 338.5368046415996, 340.815058870799, 343.0959308890863, 345.3794070622669, 347.6654738974312, 349.9541180407703, 352.2453262754350, 354.5390855194408, 356.835382823613, 359.1342053695754];

  if (n < 201) {
    return lg[n-1];
  }

  // For n>200, use the approx. formula given by numerical recipe
  // relative error < 2e-10
  var coef = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6];
  var stp = 2.5066282746310005;
  var x = 0.5*n;
  var y = x;
  var tmp = x + 5.5;
  tmp = (x+0.5)*Math.log(tmp) - tmp;
  var ser = 1.000000000190015; 
  for (var i=0; i<6; i++) {
     y = y + 1;
     ser = ser + coef[i]/y;
  }
  var gamln = tmp + Math.log(stp*ser/x);
  return gamln;
}

// Returns the incomplete gamma function P(n/2,x) evaluated by 
// series representation. Algorithm from numerical recipe.
// Assume that n is a positive integer and x>0, won't check arguments.
// Relative error controlled by the eps parameter
function gser(n,x) {
  var maxit = 100000000;
  var eps = 1.e-8;
  var gln = gamnln(n);
  var a = 0.5*n;
  var ap = a;
  var sum = 1.0/a;
  var del = sum;
  for (var n=1; n<maxit; n++) {
     ap++;
     del = del*x/ap;
     sum += del;
     if (del < sum*eps) { break;}    
  }
  return sum*Math.exp(-x + a*Math.log(x) - gln);
}

// Returns the incomplete gamma function Q(n/2,x) evaluated by
// its continued fraction representation. Algorithm from numerical recipe.
// Assume that n is a postive integer and x>0, won't check arguments.
// Relative error controlled by the eps parameter
function gcf(n,x) {
  var maxit = 100000000;
  var eps = 1.e-8;
  var gln = gamnln(n);
  var a = 0.5*n;
  var b = x+1-a;
  var fpmin = 1.e-300;
  var c = 1/fpmin;
  var d = 1/b;
  var h=d;
  for (var i=1; i<maxit; i++) {
     var an = -i*(i-a);
     b += 2;
     d = an*d + b;
     if (Math.abs(d) < fpmin) { d = fpmin; }
     c = b + an/c;
     if (Math.abs(c) < fpmin) { c = fpmin; }
     d = 1/d;
     var del = d*c;
     h = h*del;
     if (Math.abs(del-1) < eps) { break; }
  }
  return h*Math.exp(-x + a*Math.log(x) - gln);
}

// Returns the incomplete Gamma function P(n/2,x) 
// Assume n is a positive integer, x>0 , won't check arguments
function gammp(n,x) {
  if (x < 0.5*n+1) {
    return gser(n,x);
  } else {
    return 1-gcf(n,x);
  }
}

// Returns the incomplete Gamma function Q(n/2,x)
// Assume n is a positive integer, x>0 , won't check arguments
function gammq(n,x) {
  if (x < 0.5*n+1) {
    return 1-gser(n,x);
  } else {
    return gcf(n,x);
  }
}

// Evaluates incomplete beta function by modified Lentz's method 
// Algorithm from numerical recipe
function betacf(a,b,x) {
  var maxit = 100000000;
  var qab = a+b;
  var qap = a+1.0;
  var qam = a-1.0; 
  var c = 1.0;
  var d = 1 - qab*x/qap;
  var fpmin = 1.e-300;
  var eps = 1.e-8;
  if (Math.abs(d) < fpmin) { d = fpmin;}
  d = 1.0/d;
  var h=d; 
  for (var m=1; m<maxit; m++) {
     var m2 = 2*m;
     var aa = m*(b-m)*x/((qam+m2)*(a+m2));
     d = 1+aa*d;
     if (Math.abs(d) < fpmin) { d = fpmin;}
     c = 1+aa/c;
     if (Math.abs(c) < fpmin) { c = fpmin;} 
     d = 1.0/d;
     h = h*d*c;
     aa = -(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
     d = 1+aa*d;
     if (Math.abs(d) < fpmin) { d = fpmin;}
     c = 1+aa/c;
     if (Math.abs(c) < fpmin) { c = fpmin;}
     d = 1.0/d;
     var del = d*c;
     h = h*del;
     if (Math.abs(del-1.0) < eps) { break;} 
  }
  return h;
}

// Returns the incomplete beta function I_x(n/2,m/2) for positive integers n and m
//     and 0<=x<=1
// Warning: won't check arguments
// Algorithm from numerical recipe 
function betai(n,m,x) {
  var bt;
  var a = 0.5*n;
  var b = 0.5*m;
  if (x==0 || x==1) {
    bt = 0.0;
  } else {
    bt = Math.exp(gamnln(m+n)-gamnln(n)-gamnln(m) + a*Math.log(x) + b*Math.log(1-x) );
  }
  var beti;
  if (x < (a+1.0)/(a+b+2)) {
    // use continued fraction directly
    beti = bt*betacf(a,b,x)/a;
  } else {
    // use continued fraction after making the symmetry transformation
    beti = 1.0 - bt*betacf(b,a,1-x)/b;
  }
  return beti;
}

// p-value for chi^2 distribution
// When ptype=1: returns 1-F_{chi^2}(chi2; n)
// When ptype=2: returns the cdf F_{chi^2}(chi2; n)
// same as R's function pchisq(chi2,n,lower.tail=FALSE) for ptype = 1
// same as R's function pchisq(chi2,n) for ptype = 2
function pchisq(chi2,n,ptype) {
  if (ptype==1) { 
    return gammq(n, 0.5*chi2);
  } else {
    return gammp(n, 0.5*chi2);
  }
}

// inverse of pchisq
// same as R's function qchisq(p,n,lower.tail=FALSE) for ptype = 1
// same as R's function qchisq(p,n) for ptype = 2
// Assume that 0 <= p <= 1 and n is positive integer. 
// Won't check arguments.
// Find root using bisection, relative accuracy set by eps 
function qchisq(p,n,ptype) {
   // Special cases
   if (ptype==1) { 
     if (p==0) { return 1/0; } 
     if (p==1) { return 0;}
   }

   if (ptype==2) {
     if (p==0) {return 0;}
     if (p==1) {return 1/0;}
   }

  var eps = 1.e-6

  // bracket the root
  var min = 0;
  var sd = Math.sqrt(2.0*n);
  var max = 2*sd;
  var s = 1;
  if (ptype==2) {s=-1;}
  // pchisq is decreasing for ptype=1, increasing for ptype=2
  while (s*pchisq(max,n,ptype) > p*s) {
    min = max; 
    max += 2*sd;
  }

  var fun = function(x) {return pchisq(x,n,ptype)-p;}

  return bisection(fun, min,max, eps, 0);
}

// ptype = 0: calculate P(<t) = F_t(t;n)
// ptype = 1: calculate P(>t) = 1 - F_t(t;n)
// ptype = 2: calculate P(>|t|) = 2[1-F_t(|t|;n)]
// ptype = 3: calculate P(<|t|) = 1 - 2[1-F_t(|t|;n)]
function pt(t,n,ptype) {
   var x = 1.0*n/(t*t+n);
   var p = betai(n,1,x);
   if (ptype==0) {
      if (t > 0) {
         p = 1-0.5*p;
      } else {
         p = 0.5*p;
      }
   } else if (ptype==1) {
     if (t > 0) {
       p = 0.5*p;
     } else {
       p = 1-0.5*p;
     }
   } else if (ptype==3) {
     p = 1-p;
   }
   return p;
}

// inverse of pt
// ptype = 0: Calculate t so that P(<t) = p
// ptype = 1: Calculate t so that P(>t) = p
// ptype = 2: Calculate t so that P(>|t|) = p
// ptype = 3: Calculate t so that P(<|t|) = p
// Relative accuracy set by eps
function qt(p,n,ptype) {
  if (p==0) {
    if (ptype==1 || ptype==2) {
        return 1/0;
    } else if (ptype==0) {
        return -1/0;
    } else {
        return 0;
    }
  }
  if (p==1) {
    if (ptype==0 || ptype==3) {
      return 1/0;
    } else if (ptype==1) {
      return -1/0;
    } else {
      return 0;
    }
  }

  var eps = 1.e-6;

  // Want to find t for which pt(t,n,ptype) = p. Turn it into the equation 
  // pt(|t|,n,1) = p1.
  var p1=p;
  if (ptype==0 && p>0.5) {
     p1 = 1-p;
  } else if (ptype==1 && p>0.5) {
     p1 = 1-p;
  } else if (ptype==2) {
    p1 = 0.5*p;
  } else if (ptype==3) {
    p1 = 0.5*(1-p);
  }

  // Find tmax and tmin to bracket t with pt(t,n,1) = p1
  var tmp = (gamnln(n+1) - gamnln(n))/n + (0.5-1.0/n)*Math.log(n);
  tmp = tmp - Math.log(p1)/n - 0.5*Math.log(Math.PI)/n;
  var tmax = Math.exp(tmp);
  var tmin = Math.exp(tmp - (0.5+0.5/n)*Math.log(2.0));
  if (tmin*tmin < n) { 
     tmp = Math.exp(gamnln(n) - gamnln(n+1) + 0.5*(n+1)*Math.log(2.0));
     tmp = tmp*p1*Math.sqrt(n*Math.PI);
     tmin = Math.sqrt(n)+ Math.sqrt(1.0/n) - tmp;
     tmin = Math.max(tmin, 0);
  }
  if (pt(tmin,n,1) < p1) {
    //console.log("Warning! tmin is wrong!", tmin,p1);
    tmin = 0.5*tmin;
    while (pt(tmin,n,1) < p1) {
        tmin = 0.5*tmin;
    }
  }
  if (pt(tmax,n,1) > p1) {
    //console.log("Warning! tmax is wrong!",tmax,p1);
    tmax = 2*tmax;
    while (pt(tmax,n,1) > p1) {
        tmax = 2*tmax;
    }
  }
  
  // Find t using the bisection method 
  var fun = function(x) {return pt(x,n,1)-p1;}
  var t = bisection(fun, tmin,tmax, eps, 0);

  if ( (ptype==0 && p<0.5) || (ptype==1 && p>0.5) ) {
    t = -t;
  }
    
  return t;
}

// ptype=1: compute P(>F, df1, df2) = 1-F_F(F; df1,df2)
// ptype=2: compute P(<F, df1,df2) = F_F(F; df1,df2)
// Assume df1 and df2 are positive integers, and F>=0 (won't check arguments)
function pf(F,df1,df2,ptype) {
   if (F==0) {
     if (ptype==1) {
       return 1;
     } else {
       return 0;
     }
   }

   if (ptype==1) {
     var x = df2/(df1*F + df2);
     return betai(df2,df1,x);
   } else {
     var x = df1*F/(df1*F + df2);
     return betai(df1,df2,x);
   }
}

// inverse of pf
// ptype=1: compute F s.t. P(>F, df1, df2) = p
// ptype=2: compute F s.t. P(<F, df1,df2) = p
// Assume df1 and df2 are positive integers, and 0<= p <=1 (won't change arguments)
// relative accuracy set by eps
function qf(p,d1,d2,ptype) {
  if (p==0) {
    if (ptype==1) {
      return 1/0;
    } else {
      return 0;
    }
  } 

  if (p==1) {
    if (ptype==1) {
      return 0;
    } else {
      return 1/0;
    }
  }

  var eps = 1.e-6;

  // Find lower and upper values to bracket the root for bisection search
  var Fmax;
  var Fmin; 
  var s = 3-2*ptype; // 1 or -1: p decreases or increases with F
  var f21 = 1.0;
  var p21 = pf(f21, d1,d2, ptype);
 
  if (s*pf(f21,d1,d2,ptype) > s*p) {
    Fmin = f21;
    Fmax = 2*f21;
    while (s*pf(Fmax,d1,d2,ptype) > s*p) {
      Fmin = Fmax;
      Fmax = 2*Fmax;
    }
  } else {
    Fmax = f21;
    Fmin = 0.5*f21;
    while (s*pf(Fmin,d1,d2,ptype) <= s*p) {
      Fmax = Fmin;
      Fmin = 0.5*Fmin;
    }
  }
    
  var fun = function(x) {return pf(x,d1,d2,ptype)-p;}

  return bisection(fun, Fmin,Fmax, eps, 0);
}