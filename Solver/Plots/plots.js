import {SvgPlus, Vector} from "../../SvgPlus/4.js";
let styles = new SvgPlus("style");
styles.innerHTML = `
  svg-plot {
    display: grid;
    grid-template-columns: 1.5em;
  }
  .grid .zero-line {
    stroke: #777777;
  }
  svg-plot .title {
    grid-row-start: 1;
    grid-column-start: 1;
    grid-row-end: 1;
    grid-column-end: 3;
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }
  svg-plot .legend {
    grid-row-start: 2;
    grid-column-start: 1;
    grid-row-end: 2;
    grid-column-end: 3;
    display: flex;
    justify-content: center;
    gap: 1.5em;
  }
  svg-plot .legend-icon {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }
      svg-plot .legend-icon svg {
      height: 1em;
    }

  svg-plot svg{
    grid-row-start: 3;
    grid-column-start: 2;
    grid-row-end: 3;
    grid-column-end: 2;
  }
  svg-plot .y-label {
    grid-row-start: 3;
    grid-column-start: 1;
    grid-row-end: 3;
    grid-column-end: 1;
    text-align: center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  svg-plot .x-label {
    grid-row-start: 4;
    grid-column-start: 2;
    grid-row-end: 4;
    grid-column-end: 2;
    text-align: center;
  }


  svg-plot svg path {
    stroke: black;
    fill: none;
    stroke-linecap: round;
  }
  .ticks path{
    stroke: black;
    fill: none;
  }
  .grid path {
    stroke: #0003;
    stroke-width: 0.5;
    fill: none;
  }`
document.body.appendChild(styles)

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

function round(num, i) {
  return Math.round(Math.pow(10, i) * num)/Math.pow(10, i);
}

function makeTicks(pstart, pend, astart, aend, mindist) {
  // console.log("axis start " + astart);
  // console.log("axis end " + aend);

  let psize = pend.sub(pstart);
  // console.log("plot size " + psize);
  let asize = aend.sub(astart);

  let minpinc = new Vector(mindist, -mindist);
  let minainc = minpinc.div(psize).mul(asize);
  let aincs = new Vector(getBestInc(minainc.x), getBestInc(minainc.y));
  // console.log("axis incs " + aincs);

  let tickaStarts = astart.div(aincs).ceil().mul(aincs);
  // console.log("tick axis start " + tickaStarts);

  let tickCount = aend.sub(tickaStarts).div(aincs).floor().add(1);
  // console.log("ticks " + tickCount);

  let ticks = [];
  let apos = new Vector(tickaStarts.x, astart.y);
  if (apos.x !== astart.x) {
    ticks.push([round(astart.x, 1), pstart, "v"])
  }
  for (let i = 0; i < tickCount.x; i++) {
    let ppos = apos.sub(astart).div(asize).mul(psize).add(pstart);
    ticks.push([round(apos.x, 1), ppos, "v"]);
    apos = apos.addH(aincs.x);
  }

  apos = new Vector(astart.x, tickaStarts.y);
  if (apos.y !== astart.y) {
    ticks.push([round(astart.y, 1), pstart, "h"])
  }
  for (let i = 0; i < tickCount.y; i++) {
    let ppos = apos.sub(astart).div(asize).mul(psize).add(pstart);
    ticks.push([round(apos.y, 1), ppos, "h"]);
    apos = apos.addV(aincs.y);
  }

  return ticks
}

class SvgPlot extends SvgPlus{
  constructor(el){
    super(el);
    this._data = [];
    this["axis-size"] = new Vector();
    this["plot-size"] = new Vector(300, 200);
    this["font-size"] = 5;
  }

  onconnect(){
    // this.render();
  }

  get data(){
    return [...this._data];
  }

  set ["plot-size"](value) {
    this._size = V(value);
  }
  set size(value) {this["plot-size"] = value;}
  get size(){
    return this._size;
  }

  set ["grid-on"](value) {
    this._gridOn = value != null;
  }
  set gridOn(value) {this["grid-on"] = value;}
  get gridOn(){
    return this._gridOn;
  }

  set ["font-size"](value) {
    this._fontSize = parseFloat(value);
  }
  set fontSize(value) {this["font-size"] = value;}
  get fontSize(){
    return this._fontSize;
  }

  set ["y-label"](value) {
    this._ylabel = value;
  }
  set ylabel(value) {this["y-label"] = value;}
  get ylabel(){
    return this._ylabel;
  }

  set ["x-label"](value) {
    this._xlabel = value;
  }
  set xlabel(value) {this["x-label"] = value;}
  get xlabel(){
    return this._xlabel;
  }

  set ["axis-start"](value) {
    this._axisStart = V(value);
  }
  set axisStart(value) {this["axis-start"] = value;}
  get axisStart(){
    return this._axisStart;
  }

  set ["axis-end"](value) {
    this._axisEnd = V(value);
  }
  set axisEnd(value) {this["axis-end"] = value;}
  get axisEnd(){
    return this._axisEnd;
  }

  get value(){
    return this;
  }

  get tickLength(){
    return this.fontSize;
  }
  get padAxis(){
    return this.fontSize * 3.5;
  }
  get padEnd(){
    return this.fontSize;
  }
  get fs2fc(){return 0.33;}

  get plotStart(){
    let {size} = this;
    return new Vector(0, size.y);
  }
  get plotEnd(){
    let {size} = this;
    return new Vector(size.x, 0);
  }
  get a2psize(){
    let {axisStart, axisEnd, plotStart, plotEnd} = this;
    console.log(axisStart, axisEnd, plotStart, plotEnd);
    return plotEnd.sub(plotStart).div(axisEnd.sub(axisStart));
  }


  axis2plot(x, y) {
    let {axisStart, axisEnd, plotStart, plotEnd} = this;
    let v = new Vector(x, y);
    return v.sub(axisStart).div(axisEnd.sub(axisStart))
           .mul(plotEnd.sub(plotStart)).add(plotStart);
  }

  make_svg(){
    let {svg, size, padAxis, padEnd, datag} = this;
    this.clipId = "clip" + performance.now();
    svg.createChild("defs", {content: `
      <clipPath id="${this.clipId}">
        <rect x="0" y="0" width="${size.x}" height="${size.y}" />
      </clipPath>
      <filter id="glow" height="300%" width="300%" x="-25%" y="-25%">
		<!-- Thicken out the original shape -->
		<feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />

		<!-- Use a gaussian blur to create the soft blurriness of the glow -->
		<feGaussianBlur in="thicken" stdDeviation="3" result="blurred" />

		<!-- Change the colour -->
		<feFlood flood-color="rgb(255,0,255)" result="glowColor" />

		<!-- Color in the glows -->
		<feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />

		<!--	Layer the effects together -->
		<feMerge>
			<feMergeNode in="softGlow_colored"/>
			<feMergeNode in="SourceGraphic"/>
		</feMerge>

	</filter>
    `});
    datag.props = {"clip-path": "url(#plot-clip)"}
    let tsize = size.add(padAxis + padEnd);
    svg.props = {
      viewBox: `${-padAxis} ${-padEnd} ${tsize.x} ${tsize.y}`
    };
  }

  add_tick(tick, gridOn) {
    let [label, pos, tickdir] = tick;
    let {size, tickg, gridg, fontSize, tickLength, fs2fc} = this;
    tickg.createChild("path", {
      d: `M${pos}${tickdir}${tickLength * (tickdir == 'v' ? -1 : 1)}`}
    );
    if (gridOn) {
      gridg.createChild("path", {
        class: label == 0 ? "zero-line" : "",
        d: `M${pos}${tickdir}${(tickdir == 'v' ? -size.y : size.x)}`}
      );
    }

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

  make_default_ticks(gridOn){
    let {plotStart, plotEnd, axisStart, axisEnd, fontSize} = this;
    let ticks = makeTicks(plotStart, plotEnd, axisStart, axisEnd, fontSize * 2.5);
    for (let tick of ticks) {
      this.add_tick(tick, gridOn);
    }
  }

  make_axis(){
    let {axisg, size} = this;
    axisg.createChild("path", {stroke: "black", fill: "none", d: `M${new Vector}v${size.y}h${size.x}v${-size.y}h${-size.x}`});
  }


  line(name, xy) {
    this._data.push(["line", name, xy]);
  }
  plot_line(name, xy){
    let {datag} = this;
    let d = "";
    for (let [x, y] of xy) {
      d += `${d == "" ? "M" : "L"}${this.axis2plot(x, y)}`;
    }
    datag.createChild("path", {class: name + " line", d: d});
  }
  line_legend_icon(name) {
    let icon = null;
    if (typeof name === "string" && name !== "") {
      icon = new SvgPlus("div");
      icon.createChild("svg", {viewBox: "0 0 20 10"}).
      createChild("g", {class: "data"}).
      createChild("path", {class: "line " + name, d: "M0,5L22,5L22,0"})
      icon.createChild("span", {content: name})
    }
    return icon;
  }
  line_range(name, xy) {
    let xmin = null;
    let ymin = null;
    let xmax = null;
    let ymax = null;
    for (let [x, y] of xy) {
      if (xmin == null || x < xmin) xmin = x;
      if (ymin == null || y < ymin) ymin = y;
      if (xmax == null || x > xmax) xmax = x;
      if (ymax == null || y > ymax) ymax = y;
    }
    return [xmin, ymin, xmax, ymax];
  }

  scatter(name, xy, sz = 5, c = null) {
    this._data.push(["scatter", name, xy, sz, c]);
  }
  plot_scatter(name, xy, sz = 5, c = null) {
    let {datag} = this;
    let d = "";
    let scatterg = datag.createChild("g", {class: name + " scatter"})
    for (let i = 0; i < xy.length; i++) {
      let v = this.axis2plot(xy[i][0], xy[i][1]);
      let r = sz;
      if (Array.isArray(sz) && i < sz.length) {
        r = sz[i];
      }
      if (typeof r !== "number") {
        r = 1;
      }
      let props = {
        cx: v.x,
        cy: v.y,
        r: r,
      }

      let color = c;
      if (Array.isArray(c) && i < c.length) {
        color = c[i];
      }
      if (typeof color === "string" && color !== "") {
        props.fill = color;
      }
      scatterg.createChild("circle", props);
    }
  }
  scatter_legend_icon(name, xy, sz = 5, c = null) {
    let icon = null;
    if (typeof name === "string" && name !== "") {
      icon = new SvgPlus("div");
      let circ = icon.createChild("svg", {viewBox: "-5 -5 10 10"}).
      createChild("g", {class: "data"}).
      createChild("circle", {class: name,
        r: 3,
      })
      if (typeof c === "string") {
        circ.props = {fill: c};
      }
      icon.createChild("span", {content: name})
    }
    return icon;
  }
  scatter_range(name, xy) {
    let xmin = null;
    let ymin = null;
    let xmax = null;
    let ymax = null;
    for (let [x, y] of xy) {
      if (xmin == null || x < xmin) xmin = x;
      if (ymin == null || y < ymin) ymin = y;
      if (xmax == null || x > xmax) xmax = x;
      if (ymax == null || y > ymax) ymax = y;
    }
    return [xmin, ymin, xmax, ymax];
  }

  intercept(name, x, y, sz = 5, c = null) {
    this._data.push(["intercept", name, x, y, sz, c]);
  }
  plot_intercept(name, x, y, sz = 5, c = null) {
  }
  intercept_legend_icon(){
    return null;
  }
  intercept_range(name, x, y) {
    return [x, y, x, y];
  }

  get_data_range(){
    let {data} = this;
    let rxmin = null;
    let rymin = null;
    let rxmax = null;
    let rymax = null;

    console.log(data);
    for (let plotArgs of data) {
      try {
        let args = [...plotArgs];
        let type = args.shift();
        let rangef = type + "_range";
        if (this[rangef] instanceof Function) {
          try {
            let [xmin, ymin, xmax, ymax] = this[rangef].apply(this, args);
            if (rxmin == null || xmin < rxmin) rxmin = xmin;
            if (rymin == null || ymin < rymin) rymin = ymin;
            if (rxmax == null || xmax < rxmax) rxmax = xmax;
            if (rymax == null || ymax < rymax) rymax = ymax;
          } catch (e) {
          }
        }
      } catch(e){
      }
    }

    console.log(rxmin, rymin, rxmax, rymax);

    return [new Vector(rxmin, rymin), new Vector(rxmax, rymax)];
  }

  plot_data(){
    let {data} = this;

    for (let plotArgs of data) {
      try {
        let args = [...plotArgs];
        let type = args.shift();
        let plotname = "plot_" + type;
        if (this[plotname] instanceof Function) {
          try {
            this[plotname].apply(this, args)
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {

      }
    }
  }

  make_legend(){
    let {data, legend} = this;
    for (let plotArgs of data) {
      try {
        let args = [...plotArgs];
        let type = args.shift();
        let legendf = type + "_legend_icon";
        if (this[legendf] instanceof Function) {
          try {
            let icon = this[legendf].apply(this, args);
            if (icon !== null) {
              icon.class = "legend-icon";
              legend.appendChild(icon);
            }
          } catch (e) {
            console.log("error making legend icon");
          }
        }
      } catch(e){
        console.log("bad data series arguments");
      }
    }
  }



  render(){
    this.innerHTML = "";
    let {xlabel, ylabel, title, gridOn, axisStart, axisEnd} = this;
    if (!axisStart || !axisEnd) {
      [this.axisStart, this.axisEnd] = this.get_data_range();
    }

    this.createChild("div", {class: "title", content: title});
    this.legend = this.createChild("div", {class: "legend"});
    this.svg = this.createChild("svg");
    this.createChild("div", {class: "y-label", content: ylabel});
    this.createChild("div", {class: "x-label", content: xlabel});

    this.gridg = this.svg.createChild("g", {class: "grid"});
    this.tickg = this.svg.createChild("g", {class: "ticks"});
    this.datag = this.svg.createChild("g", {class: "data"})
    this.axisg = this.svg.createChild("g", {class: "axis"});

    this.make_svg();

    this.make_axis();

    this.make_default_ticks(gridOn)

    this.plot_data();

    this.make_legend();
  }

  clear(){
    this._data = [];
  }

  static get observedAttributes() {return ["plot-size", "font-size", "x-label", "y-label", "axis-start", "axis-end", "grid-on"]}
}

SvgPlus.defineHTMLElement(SvgPlot);
