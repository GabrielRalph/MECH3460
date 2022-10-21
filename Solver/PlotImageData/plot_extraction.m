% plotimg = im2double(imread("DvsKs2.png"));
% oy = 1;
% ox = 0;
% ex = 250;
% ey = 1.8;
clc;
clear;
clf;

urldir = "https://mech3460.w4v.es/Solver/PlotImageData/";
pimg = imread("keyway2.png");
pDimg = imread("keyway.png");
plotim = PlotImage(pimg, [0, 0], [1000, 3]);
imshow(pDimg);
plotim.plot()

% plotim.saveJSON("fitted.json", "https://mech3460.w4v.es/Solver/PlotImageData/fitted.png");