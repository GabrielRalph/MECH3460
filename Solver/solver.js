
let tex2js_functions = [
  ["\\cfrac\s*{([^}]+)}\s*{([^}]+)}", "(($1)/($2))"],
  ["\\sqrt\s*{([^}]+)}", "sqrt($1)"],
  ["(\\cdot|\\times)", "*"],
  ["(\w+)\s*\^\s*(\w+)", "pow($1, $2)"],
  ["\\quad", " "],
  [""]
]

// find the idicies of all highest order open and close brackets
//  throws error if bracket mismatch occurs
function find_bracket_intervals(text) {
  let open = 0;
  let intvs = [];
  for (let i = 0; i < text.length; i++) {
    let newOpen = open;
    if (text[i] in BRACKETS.open){
      newOpen += 1;
    }
    if (text[i] in BRACKETS.close) {
      newOpen -= 1;
    }

    // opening
    if (newOpen == 1 && open == 0) {
      intvs.push(i);

    // closing
    } else if (newOpen == 0 && open == 1) {
      intvs.push(i + 1);
    }

    open = newOpen;

  }

  if (open < 0) {
    throw new ExpError("bracket", "bracket missmatch, to many closing brackets");
  }else if (open > 0) {
    throw new ExpError("bracket", "bracket missmatch, to many opening brackets");
  }


  return intvs;
}

// works similar to replace but using an array of intervals
function replace_intervals(text, intvs, value, soffset = 1, eoffset = 1) {
  let temp = {};

  // invalid check
  if (intvs.length == 0) {
    return text;
  }

  intvs.push(0);
  intvs.push(text.length);
  intvs.sort((a,b) => a > b ? 1 : -1);

  let res = "";
  for (let i = 0, j = 0; i < intvs.length - 1; i+=2, j++) {
    let id = value(j);
    let s = intvs[i];
    let e = intvs[i + 1];
    let be = intvs[i + 2];

    if (be) {
      let tbefore = "";
      if (e > s) tbefore = text.slice(s, e);
      res += tbefore + id;
      temp[id] = text.slice(e + soffset, be - eoffset);
    } else if (e > s) {
      res += text.slice(s, e);
    }
  }

  return [res, temp]
}

function replace_brackets(text) {

}

function tex2jseq(tex) {
  let brackets = [];
  tex = replace_brackets(tex, (subtex) => {
    let bid = ` __bracket__${bi} `;
    brackets.push([bid, tex2jseq]);
    return bid;
  });

  for (let [regex, repexp] of tex2js_functions) {
    tex = tex.replace(new RegExp(regexp, "g"), repexp)
  }
}
