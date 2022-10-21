
window.MathJax = {
  loader: {load: ["input/tex", "output/svg",'[tex]/color', '[tex]/colortbl']},
  tex: {
    packages: {'[+]': ['color', 'colortbl']},
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    macros: {
      trans: `\\underset{heat}{\\overset{cool}{\\rightleftharpoons}}`,
      mat: ["\\left[ \\begin{matrix} #1 \\end{matrix} \\right]", 1],
      eq: ["\\begin{equation} #1 \\label{#2} \\end{equation}", 2],
      dpar: ["\\cfrac{\\partial #1}{\\partial #2}", 2],
      hl: ["{\\color{WildStrawberry} #1}", 1],
      tx: ["\\text{#1}", 1],
      red: ["{\\color{BrickRed} {#1}_1}", 1],
      blue: ["{\\color{RoyalBlue} {#1}_2}", 1],
    },
    tags: "ams",
  },
  svg: {
    scale: 1,                      // global scaling factor for all expressions
    minScale: .5,                  // smallest scaling factor to use
    mtextInheritFont: false,       // true to make mtext elements use surrounding font
    merrorInheritFont: true,       // true to make merror text use surrounding font
    mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
    skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
    exFactor: .5,                  // default size of ex in em units
    displayAlign: 'center',        // default for indentalign when set to 'auto'
    displayIndent: '0',            // default for indentshift when set to 'auto'
    fontCache: 'local',            // or 'global' or 'none'
    localID: null,                 // ID to use for local font cache (for single equation processing)
    internalSpeechTitles: true,    // insert <title> tags with speech content
    titleID: 0                     // initial id number to use for aria-labeledby titles
  }
};

export async function loadTypeset(){
  var head = document.getElementsByTagName("head")[0];
  let script = document.createElement("script");
  script.type = "text/javascript";
  return new Promise(function(resolve, reject) {
    script.onload = () => {
      // console.log(MathJax);
      resolve()
    }
    script.src  = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
    head.appendChild(script);
  });
}
export function typeset(input) {
  if (MathJax && MathJax.typeset) {
    MathJax.typeset(input)
  }
}
export function svgTypeset(input) {
  console.log(MathJax);
  // let el = MathJax.tex2chtml("x^2");
  // return el;
}
