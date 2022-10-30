import {SvgPlus} from "../SvgPlus/4.js"

const PAGE_SIZES = {
  "A4": [210, 297],
  "A4 landscape": [297, 210],

  "A3": [297, 420],
  "A3 landscape": [420, 297],

  "A2 landscape": [420, 594],
  "A2": [594, 420],
}
async function delay(t) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, t);
  });
}

async function waitPrint(){
  return new Promise(function(resolve, reject) {
    window.onafterprint = resolve;
  });
}

function printStyle(size){
  if (!(size in PAGE_SIZES)) size = "A4";
  let [pw, ph] = PAGE_SIZES[size];
  let style = new SvgPlus("style");
  style.innerHTML = `
    @page {
      size: ${pw}mm ${ph}mm;
      margin: 0;
    }
    body {
      display: block;
      width: 100vw;
      height: calc(100vw * ${0.995 * (ph / pw)});
      padding: 0;
      margin: 0;
    }

    body :not(.print-frame) {
      display: none;
    }

    body .print-frame *{
      display: inherit;
    }

    .print-frame {
      width: 100%;
      height: 100%;
      overflow:hidden;
    }

    .print-frame img {
      width: 100%;
    }
  `
  return style;
}

let Body = new SvgPlus(document.body);

class PrintImg extends SvgPlus {
  onclick(){
    console.log("print");
    this.print();
  }


  async print(){
    let style = printStyle(this.getAttribute("size"));
    let printFrame = Body.createChild("div", {
      class: "print-frame",
      content: this.innerHTML,
    })
    Body.appendChild(style);

    window.print();
    // await waitPrint();

    style.remove();
    printFrame.remove();
  }


}

SvgPlus.defineHTMLElement(PrintImg);
