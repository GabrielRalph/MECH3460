% plotimg = im2double(imread("DvsKs2.png"));
% oy = 1;
% ox = 0;
% ex = 250;
% ey = 1.8;

pd = extract_poly(imread("DrvsDelta2.png"), 1, 0, 2, 0.16, 3);

function p = extract_poly(plotimg, ox, oy, ex, ey, d)
    red = plotimg(:, :, 1) > 0.8 & plotimg(:, :, 2) < 0.3 & plotimg(:, :, 3) < 0.3;
    blue = plotimg(:, :, 1) < 0.3 & plotimg(:, :, 2) < 0.3 & plotimg(:, :, 3) > 0.8;
    green = plotimg(:, :, 1) < 0.3 & plotimg(:, :, 2) > 0.8 & plotimg(:, :, 3) < 0.3;

    [h, ~] = size(red);
    pidxs = find(red);
    y = mod(pidxs - 1, h) + 1;
    x = floor(pidxs / h);

    pidxs = find(blue);
    oyi = mod(pidxs - 1, h) + 1;
    oxi = floor(pidxs / h);

    pidxs = find(green);
    eyi = mod(pidxs - 1, h) + 1;
    exi = floor(pidxs / h);

    x = ox + (ex - ox) * (x - oxi) / (exi - oxi);
    y = oy + (ey - oy) * (y - oyi) / (eyi - oyi);
    p = polyfit(x, y, 8);

    x1 = linspace(min(x), max(x), 500);
    y1 = polyval(p, x1);
    scatter(x, y, d);
    hold on;
    plot(x1, y1);
end