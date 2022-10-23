import {SvgPlus} from "../../SvgPlus/4.js"

const COLOURS = [
  "hsl(360, 100%, 50%)",
  "hsl(300, 100%, 50%)",
  "hsl(240, 100%, 50%)",
  "hsl(180, 100%, 50%)",
  "hsl(120, 100%, 50%)",
  "hsl(60, 100%, 50%)",
]

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

    let data = await fetch(src);
    let json = await data.json();
    let {width, height, imgsrc, pixelstart, pixelend, pixelpoints, rangestart, rangeend} = json;

    let nsigs = 1;
    let p0 = pixelpoints[0];
    if (Array.isArray(p0)) nsigs = p0.length;

    let svg = this.createChild("svg", {viewBox: `0 0 ${width} ${height}`});
    let image = svg.createChild("image", {href: imgsrc, x: 0, y: 0, width: width, height: height});
    let th = width/400;
    let pp = svg.createChild("g", {style: {
      "stroke-width": th
    }});

    this.value = (rx) => {
      let px = pixelstart[0] + (rx - rangestart[0]) * (pixelend[0] - pixelstart[0]) / (rangeend[0] - rangestart[0]);
      px =  Math.round(px);

      let ys = (new Array(nsigs)).fill(NaN);
      if (px in pixelpoints) {
        let pys = pixelpoints[px];
        if (!Array.isArray(pys))
          pys = [pys];

        pp.innerHTML = "";
        for (let i = 0; i < nsigs; i++) {
          let py = pys[i];
          if (py !== null) {
            pp.createChild("path", {stroke: COLOURS[i], fill: "none", d: `M${px},${pixelstart[1]}L${px},${py}L${pixelstart[0]},${py}`})
            pp.createChild("circle", {fill: COLOURS[i], r: th * 2, cx: px, cy: py});
            let y = rangestart[1] + (py - pixelstart[1]) * (rangeend[1] - rangestart[1]) / (pixelend[1] - pixelstart[1]);
            ys[i] = y;
          }
        }
      }

      if (nsigs === 1)
        ys = ys[0];

      return ys;
    }
    console.log("%c\t\tplot loaded", "color: yellow;");
    this.loading = null;
  }
}

SvgPlus.defineHTMLElement(PlotImage);
