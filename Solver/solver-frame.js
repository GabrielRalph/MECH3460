import {SvgPlus} from "../SvgPlus/4.js"
import {loadTypeset, typeset} from "./typeset.js"
import {} from "./PlotImageData/plot-image.js"
import {} from "./Plots/plots.js"

const DEFUALT_SCOPE = {
  cos: Math.cos,
  acos: Math.acos,
  sin: Math.sin,
  tan: Math.tan,
  atan: Math.atan,
  sqrt: Math.sqrt,
  pow: Math.pow,
  abs: Math.abs,
  pi: Math.PI,
}

function getScopeNameValues(scope) {
  let scopeNames = [];
  let scopeValues = [];
  for (let s of [DEFUALT_SCOPE, scope]) {
    for (let name in s) {
      scopeNames.push(name);
      scopeValues.push(s[name]);
    }
  }
  return [scopeNames, scopeValues]
}

function solveValue(value, scope) {
  if (typeof value === "string") {
    let [scopeNames, scopeValues] = getScopeNameValues(scope)
    scopeNames.push(`"use strict";return (${value})`);
    let soln = NaN;
    try {
      soln = Function.apply(null, scopeNames).apply(null, scopeValues);
    }catch(e) {
      console.log("expression error " + value);
    }
    value = soln;
  }
  return value;
}

function solveScript(script, scope) {
  let [scopeNames, scopeValues] = getScopeNameValues(scope);

  let soln = {};
  scopeNames.push(`"use strict"; ${script}`);
  try {
    soln = Function.apply(null, scopeNames).apply(null, scopeValues);
  } catch(e) {
    console.log("script error");
    console.log(e);
  }

  if (typeof soln === "object" && soln !== null) {
    for (let key in soln) {
      scope[key] = soln[key];
    }
  }
}

function resizeInput(input) {
  if (input instanceof HTMLInputElement) {
    let sc0 = input.scrollWidth;
    input.setAttribute("style", "width: 0");
    window.requestAnimationFrame(() => {
      let sc1 = input.scrollWidth;
      // console.log(sc0, sc1);
      input.setAttribute("style", `width: ${sc1}px`);
    })
  }
}

class SolverFrame extends SvgPlus {
  onconnect(){
    this.loading = this.init();
    // this.solveUpdate();
  }

  // Initialisation methods
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

    this.solveUpdate();
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
      resizeInput(input);
      input.oninput = () => {
        resizeInput(input);
        this.solveUpdate();
      }
    }
  }



  get scope(){
    let scope = {};
    let elements = this.querySelectorAll(".variable, output, script");
    for (let i = 0; i < 2; i++) {
      this.clear_plots();
      for (let el of elements) {
        let tag = el.tagName.toLowerCase();
        switch (tag) {
          case "output":
          this.get_output(el, scope);
          break;
          case "script":
          this.get_script(el, scope);
          break;
          default:
          this.get_variable(el, scope);
          break;
        }
      }
    }
    return scope;
  }

  get_variable(variable, scope) {
    let name = variable.getAttribute("name");
    if (name !== null && name !== "") {
      scope[name] = solveValue(variable.value, scope)
    }
  }

  get_output(output, scope) {
    let html = output.template;
    html = html.replace(/~(\d+)?(\[\w+\])?{([^}]+)}/g, (m, dp, varn, ph) => {
      let value = solveValue(ph, scope);
      if (typeof varn === "string" && varn !== "") {
        let vname = varn.match(/\[(\w+)\]/)[1];
        if (vname) scope[vname] = value;
      }
      if (!dp) dp = 1;
      let res = "" + Math.round(value * Math.pow(10, dp))/Math.pow(10, dp);
      return res;
    });
    output.innerHTML = html;
  }

  get_script(script, scope) {
    solveScript(script.innerHTML, scope);
  }


  clear_plots(){
    let plots = document.querySelectorAll("svg-plot");
    for (let plot of plots) {
      plot.clear();
    }
  }
  render_plots(){
    let plots = document.querySelectorAll("svg-plot");
    for (let plot of plots) {
      try {
        plot.render();
        plot.clear();
      } catch (e) {

      }
    }
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

    this.render_plots();
    console.log("%c\t\tplots rendered", "color: lime;");
    this.waiting = false;
  }

}

SvgPlus.defineHTMLElement(SolverFrame)
