% plotimg = im2double(imread("DvsKs2.png"));
% oy = 1;
% ox = 0;
% ex = 250;
% ey = 1.8;
clc;
clear;
clf;
pimg = imread("Kstep.png");
pDimg = imread("DvsKs.png");
plotim = PlotImage(pimg, [0, 1], [200, 1.8]);
plotim.plot()

% 
% plotim.imgsrc = "DvsKs.png";
% % imshow(pDimg);
% % sig1 = plotim.pixelpoints{1};
% % hold on;
% % plot(sig1(:, 1), sig1(:, 2), 'LineWidth',2.5);
% 
% fid = fopen("Ks(D).json", "w+");
% json = jsonencode(plotim);
% fprintf(fid, "%s", json);
% fclose(fid);
% plotim.plot();
% hold on;
% plotim.yinfer(1.6)