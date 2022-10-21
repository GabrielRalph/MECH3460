import {SvgPlus} from "../../SvgPlus/4.js"

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

SvgPlus.defineHTMLElement(PlotImage);
