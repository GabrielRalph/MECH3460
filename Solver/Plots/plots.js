import {SvgPlus, Vector} from "../../SvgPlus/4.js";
import {loadTypeset, svgTypeset} from "../typeset.js";
function V(value) {
  if (typeof value === "string") {
    let stext = value.split(/\s*,\s*/);
    let x = 0;
    let y = 0;
    if (stext.length > 0) {
      x = parseFloat(stext[0]);
      if (stext.length > 1) {
        y = parseFloat(stext[1])
      } else {
        y = x;
      }
    }
    return new Vector(x, y);
  } else {
    return new Vector(value);
  }
}

function getBestInc(inc) {
  let pow = 0;

  while (inc < 1) {
    inc = inc * 10;
    pow --;
  }
  while (inc > 10) {
    inc = inc / 10;
    pow ++;
  }

  if (inc <= 2.5) {
    inc = 2.5;
  } else if (inc <= 5) {
    inc = 5;
  } else {
    inc = 1;
    pow ++;
  }

  inc = inc * Math.pow(10, pow);
  return inc;
}

function makeTicks(pstart, pend, astart, aend, subincs, mindist) {
  console.log("axis start " + astart);
  console.log("axis end " + aend);

  let psize = pend.sub(pstart);
  console.log("plot size " + psize);
  let asize = aend.sub(astart);

  let minpinc = new Vector(mindist, -mindist);
  let minainc = minpinc.div(psize).mul(asize);
  let aincs = new Vector(getBestInc(minainc.x), getBestInc(minainc.y));
  console.log("axis incs " + aincs);

  let tickaStarts = astart.div(aincs).ceil().mul(aincs);
  console.log("tick axis start " + tickaStarts);

  let tickCount = aend.sub(tickaStarts).div(aincs).floor().add(1);
  console.log("ticks " + tickCount);

  let ticks = [];
  let apos = new Vector(tickaStarts.x, astart.y);
  if (apos.x !== astart.x) {
    ticks.push([astart.x, pstart, "v"])
  }
  for (let i = 0; i < tickCount.x; i++) {
    let ppos = apos.sub(astart).div(asize).mul(psize).add(pstart);
    ticks.push([apos.x, ppos, "v"]);
    apos = apos.addH(aincs.x);
  }

  apos = new Vector(astart.x, tickaStarts.y);
  if (apos.y !== astart.y) {
    ticks.push([astart.y, pstart, "h"])
  }
  for (let i = 0; i < tickCount.y; i++) {
    let ppos = apos.sub(astart).div(asize).mul(psize).add(pstart);
    ticks.push([apos.y, ppos, "h"]);
    apos = apos.addV(aincs.y);
  }

  return ticks
}

class SvgPlot extends SvgPlus{
  constructor(el){
    super(el);
    this._signals = [];
    this["axis-size"] = new Vector();
    this["font-size"] = 0;
  }

  addSignal(xy, name, type = "line") {
    this._signals.push([xy, name, type]);
    this.render();
  }

  get signals(){return [...this._signals];}

  onconnect(){
    this.render();
  }

  set ["plot-size"](value) {
    this._size = V(value);
  }
  get size(){
    return this._size;
  }

  set ["font-size"](value) {
    this._fontSize = parseFloat(value);
  }
  get fontSize(){
    return this._fontSize;
  }

  set ["y-label"](value) {
    this._ylabel = value;
  }
  get ylabel(){
    return this._ylabel;
  }
  set ["x-label"](value) {
    this._xlabel = value;
  }
  get xlabel(){
    return this._xlabel;
  }

  set ["axis-start"](value) {
    this._axisStart = V(value);
  }
  get axisStart(){
    return this._axisStart;
  }
  set ["axis-end"](value) {
    this._axisEnd = V(value);
  }
  get axisEnd(){
    return this._axisEnd;
  }

  render(){
    this.innerHTML = "";
    // create svg
    let {size, fontSize, xlabel, ylabel, axisStart, axisEnd, signals} = this;
    let tickLength = fontSize;
    let padl = fontSize * 2.5;
    let pade = fontSize;
    let fs2fc = 0.3;


    let tsize = size.add(padl + pade)
    this.createChild("div", {class: "title", content: this.getAttribute("title")})
    let svg = this.createChild("svg", {
      viewBox: `${-padl} ${-pade} ${tsize.x} ${tsize.y}`
    });
    this.createChild("div", {class: "y-label", content: ylabel});
    this.createChild("div", {class: "x-label", content: xlabel});


    let axis = svg.createChild("g");
    let start = new Vector(0, size.y);
    let end = new Vector(size.x, 0);

    // create axi lines
    axis.createChild("path", {stroke: "black", fill: "none", d: `M${new Vector}v${size.y}h${size.x}v${-size.y}h${-size.x}`});

    let grid = axis.createChild("g", {class: "grid"})
    let tickg = axis.createChild("g", {class: "ticks"});
    let ticks = makeTicks(start, end, axisStart, axisEnd, 5, fontSize * 3);
    for (let [label, pos, tickdir] of ticks) {
      tickg.createChild("path", {
        d: `M${pos}${tickdir}${tickLength * (tickdir == 'v' ? -1 : 1)}`}
      );
      grid.createChild("path", {
        d: `M${pos}${tickdir}${(tickdir == 'v' ? -size.y : size.x)}`}
      );

      let tx = pos.x;
      let ty = pos.y + fontSize * (1 + fs2fc);
      let anc = "middle";
      if (tickdir == "h") {
        tx = pos.x - fontSize * 2 * fs2fc;
        ty = pos.y + fontSize * fs2fc;
        anc = "end";
      }
      let text = tickg.createChild("text", {
        x: tx,
        y: ty,
        "font-size": fontSize,
        content: label,
        "text-anchor": anc
      });
    }

    let sigs = svg.createChild("g", {class: "signals"});
    for (let [xy, name, type] of signals) {
      let d = "";
      for (let [x, y] of xy) {
        let v = new Vector(x, y);
        v = v.sub(axisStart).div(axisEnd.sub(axisStart)).mul(end.sub(start)).add(start);
        d += `${(d == "") ? "M" : (type == "point" ? "M" : "L")}${v}`;
        sigs.createChild("path", {d: d});
      }

    }
  }

  static get observedAttributes() {return ["plot-size", "font-size", "x-label", "y-label", "axis-start", "axis-end"]}
}
// async function load(){
  loadTypeset();
//   setTimeout(() => {

    SvgPlus.defineHTMLElement(SvgPlot);
//   }, 2000)
// }
// load();
