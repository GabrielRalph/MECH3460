import {SvgPlus} from "../SvgPlus/4.js"
import {loadTypeset, typeset} from "./typeset.js"
import {} from "./PlotImageData/plot-image.js"
import {} from "./Plots/plots.js"
import {} from "./print-img.js"

function round(num, dp = 0) {
  let pw = Math.pow(10, dp);
  return Math.round(num * pw) / pw;
}

function selectTableColumns(table, selectedColums) {
  let ntable = [];
  for (let row of table) {
    let nrow = [];
    for (let i of selectedColums) {
      nrow.push(row[i])
    }
    ntable.push(nrow);
  }
  return ntable;
}
function table2HTMLRows(table, format) {
  // console.log(table);
  console.log(format);
  let html = "";
  let i = 0;
  for (let row of table) {
    let j = 0;
    let hrow = ""
    for (let col of row) {
      if (format && format[i] && format[i][j])
        hrow += `<td class = "${format[i][j]}">${col}</td>`;
      else
        hrow += `<td>${col}</td>`;

      j++;
    }
    html += `<tr>${hrow}</tr>`;
    i++;
  }
  // console.log(html);
  return html;
}

function addCollapseHandlers(element) {
  let headers = element.querySelectorAll("section > h1");
  for (let header of headers) {
    let section = header.parentNode;
    header.onclick = () => {
      toggleCollapsed(header);
    }
    
  }
}

function toggleCollapsed(header) {
  let section = header.parentNode;
  let collapsed = section.getAttribute("collapsed") !== null;
  let collapse = !collapsed;
  section.toggleAttribute("collapsed", collapse);
  for (let input of section.querySelectorAll("input.variable")) {
    resizeInput(input);
  }
}

const LOG_MODES = {
  "init": "#1cdbfa",
  "solve": "lime",
  "user": "orange",
  "error": "#F55"
}
let FIRSTP = 0;
function log(text, mode, indent = 1) {
  if ((mode == "user" || mode == "error") && FIRSTP == 0) return;

  for (let i = 0; i < indent; i++) text = `\t${text.replace(/\n/g, "\n\t")}`;
  console.log(`%c${text}`, `color: ${LOG_MODES[mode]}`);
}



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
  round: round,
  min: (x, y) => x < y ? x : y,
  max: (x, y) => x > y ? x : y,
  selectTableColumns: selectTableColumns,
  table2HTMLRows: table2HTMLRows,
  log: (txt) => log(txt, "user", 1),
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

      log(`expression error\n${value}\n${e}`, "error", 1);
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
    log(`script error\n${e}`, "error", 1);
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
      sc1 = sc1 < 10 ? 10 : sc1;
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
    log("Initializing...", "init", 0);

    this.init_outputs();
    log("init outputs", "init");

    log("loading all plots", "init");

    await this.init_plot_images();
    log("loaded all plots", "init");

    this.init_inputs();
    log("init all inputs", "init");

    await loadTypeset();
    log("MathJax loaded", "init");

    this.solveUpdate();
    addCollapseHandlers(this);
    this.loading = false;
    log("Initialized", "init", 0);
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
    for (FIRSTP = 0; FIRSTP < 2; FIRSTP++) {
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
      let value = variable.value;
      if (variable.tagName === "TBODY") value = variable;
      scope[name] = solveValue(value, scope)
    }
  }
  get_output(output, scope, ts) {
    let html = output.template;
    html = html.replace(/(?:<!--\s*)?~(\d+)?(\[\w+\])?{([^}]+)}(?:\s*-->)?/g, (m, dp, varn, ph) => {
      let value = solveValue(ph, scope);
      if (typeof varn === "string" && varn !== "") {
        let vname = varn.match(/\[(\w+)\]/)[1];
        if (vname) scope[vname] = value;
      }
      let res = value;
      if (typeof value === "number") {
        if (!dp) dp = 1;
        res = "" + Math.round(value * Math.pow(10, dp))/Math.pow(10, dp);
      }
      return res;
    });
    output.innerHTML = html;
    if (FIRSTP) typeset([output]);
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
    typeset(plots);
  }


  async solveUpdate(){
    if (this.loading instanceof Promise) {
      if (this.waiting) return;
      this.waiting = true;
      await this.loading;
    }

    log("Solving...", "solve", 0);
    let scope = this.scope;
    log("scope solved", "solve");

    this.render_plots();
    log("plots rendered", "solve");
    this.waiting = false;
    log("Solved", "solve", 0)
  }

}

SvgPlus.defineHTMLElement(SolverFrame)
