import {SvgPlus} from "../SvgPlus/4.js"
import {loadTypeset, typeset} from "./typeset.js"

class PlotImage extends SvgPlus {
  onconnect(){
    let src = this.getAttribute("src");
    this.value = ()=>NaN;
    this.loading = this.load(src);
  }

  async load(src){
    if (this.loading instanceof Promise) {
      return await this.loading;
    }

    console.log("%cloading plot...", "color: yellow;");
    let data = await fetch(src);
    let json = await data.json();
    let {width, height, imgsrc, pixelstart, pixelend, pixelpoints, rangestart, rangeend} = json;

    let svg = this.createChild("svg", {viewBox: `0 0 ${width} ${height}`});
    let image = svg.createChild("image", {href: imgsrc, x: 0, y: 0, width: width, height: height});
    let pp = svg.createChild("g");

    this.value = (rx) => {
      let px = pixelstart[0] + (rx - rangestart[0]) * (pixelend[0] - pixelstart[0]) / (rangeend[0] - rangestart[0]);
      px =  Math.round(px);
      let y = NaN;
      if (px in pixelpoints) {
        let py = pixelpoints[px];
        if (py !== null) {
          pp.innerHTML = "";
          pp.createChild("path", {stroke: "red", fill: "none", d: `M${px},${pixelstart[1]}L${px},${py}L${pixelstart[0]},${py}`})
          pp.createChild("circle", {fill: "red", r: 3, cx: px, cy: py});
          // console.log(py, rangestart, rangeend, pixelstart, pixelend);
          y = rangestart[1] + (py - pixelstart[1]) * (rangeend[1] - rangestart[1]) / (pixelend[1] - pixelstart[1]);
        }
      }

      return y;
    }
    console.log("%c\t\tplot loaded", "color: yellow;");
    this.loading = null;
  }
}

const DEFUALT_SCOPE = {
  cos: Math.cos,
  sin: Math.sin,
  tan: Math.tan,
  sqrt: Math.sqrt,
  pow: Math.pow,
  abs: Math.abs,
}

function solveValue(value, mainScope) {
  if (value instanceof Function) {
    return value;
  }

  let scopeNames = [];
  let scopeValues = [];
  for (let scope of [DEFUALT_SCOPE, mainScope]) {
    for (let name in scope) {
      scopeNames.push(name);
      scopeValues.push(scope[name]);
    }
  }
  scopeNames.push(`"use strict";return (${value})`);
  let soln = NaN;
  try {
    soln = Function.apply(null, scopeNames).apply(null, scopeValues);
  }catch(e) {}
  return soln;
}

class SolverFrame extends SvgPlus {
  onconnect(){
    this._solver_methods = [];
    this.loading = this.init();
    this.solveUpdate();
  }

  addSolverMethod(func) {
    if (func instanceof Function) {
      this._solver_methods.push(func);
    }
    this.solveUpdate();
  }

  async init(){
    if (this.loading instanceof Promise) {
      return await this.loading;
    }
    console.log("%cinitialising...", "color: #1cdbfa;");


    this.init_outputs();
    console.log("%c\t\tinit outputs", "color: #1cdbfa;");

    console.log("%c\t\tloading all plots", "color: #1cdbfa;");

    await this.init_plot_images();
    console.log("%c\t\tloaded all plots", "color: #1cdbfa;");

    this.init_inputs();
    console.log("%c\t\tinit all inputs", "color: #1cdbfa;");

    await loadTypeset();
    console.log("%c\t\tMathJax loaded", "color: #1cdbfa;");

    this.loading = false;
  }

  async init_plot_images(){
    let plots = this.querySelectorAll("plot-image");
    for (let plot of plots) {
      await plot.load();
    }
  }

  init_outputs(){
    let outputs = this.querySelectorAll("output");
    for (let output of outputs) {
      output.template = output.innerHTML;
    }
  }

  init_inputs(){
    let inputs = this.querySelectorAll(".variable");
    for (let input of inputs) {
      input.oninput = () => {
        this.solveUpdate();
      }
    }
  }


  get scope(){
    let variables = {};
    let inputs = this.querySelectorAll(".variable");
    for (let input of inputs) {
      let name = input.getAttribute("name");
      if (name !== null && name !== "") {
        variables[name] = solveValue(input.value, variables)
      }
    }
    return variables;
  }

  async solveUpdate(){
    if (this.loading instanceof Promise) {
      if (this.waiting) return;
      this.waiting = true;
      await this.loading;
    }

    console.log("%cupdating...", "color: lime;");
    let scope = this.scope;
    console.log("%c\t\tvariables computed", "color: lime;");


    for (let solverMethod of this._solver_methods) {
      solverMethod(scope);
    }
    console.log("%c\t\tsolver methods run", "color: lime;");


    this.render_outputs(scope);
    console.log("%c\t\toutput rendered", "color: lime;");
    this.waiting = false;
  }

  render_outputs(scope) {
    let outputs = this.querySelectorAll("output");
    for (let output of outputs) {
      let html = output.template;
      html = html.replace(/~(\d+)?{([^}]+)}/g, (m, dp, ph) => {
        let value = solveValue(ph, scope);
        if (!dp) dp = 1;
        let res = "" + Math.round(value * Math.pow(10, dp))/Math.pow(10, dp);
        return res;
      });
      output.innerHTML = html;
    }
    typeset(outputs);
  }
}

SvgPlus.defineHTMLElement(PlotImage);
SvgPlus.defineHTMLElement(SolverFrame)
