% plotimg = im2double(imread("DvsKs2.png"));
% oy = 1;
% ox = 0;
% ex = 250;
% ey = 1.8;
clc;
clear;
clf;

urldir = "https://mech3460.w4v.es/Solver/PlotImageData/";
filename = "Ks(D)";

pimg = imread("DvsKs2.png");
pDimg = imread("DvsKs.png");
plotim = PlotImage(pimg, [0, 1], [250, 1.8]);

plotim.imgsrc = urldir + "DvsKs.png";

fid = fopen(filename + ".json", "w+");
json = jsonencode(plotim);
fprintf(fid, "%s", json);
fclose(fid);

fprintf("\n%s url: %s\n", filename, urldir + filename + ".json")