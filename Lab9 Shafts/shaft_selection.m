clc;clear;
Ks_D = PlotImage(imread("DvsKs2.png"), [0, 1], [250, 1.8]);
Delta_Dr = PlotImage(imread("DrvsDelta2.png"), [1, 0], [2, 1.6]);
K_step = PlotImage(imread("Kstep.png"), [0, 0], [1000, 4]);

% Constants 
Fu = 1226; % MPa
Fy = 1130; % MPa
BrHd = 356;
Mq = 70;   % Nm
Tq = 45;   % Nm
Fs = 2.5;
RPM = 100;
Fr = 0.45 * Fu;
Sy = 350;
Pq = 0;

% Fixed ratios
Ddr = 1/0.65; %  D/dr
Rdr = 1/13; %   R/dr

% Select appropriate Z value
Zvalid = [0.05, 0.1, 0.2, 0.3, 0.5];
Delta = Delta_Dr.yinfer(Ddr);
Zp = Rdr + Delta;
[~, zi] = min(abs(Zvalid - Zp));

% Select corresponding stepped shaft stress concentration factor K
Kstep = K_step.yinfer(Sy);
K = Kstep(zi);

%% Make Guess for D
X = [Mq, Pq, Tq, Fy, Fr, Fs, 40, K, 0];

% itterate till 0.1mm difference in diatmeters
error = 1;
while error > 0.1
    X(9) = Ks_D.yinfer(X(7));
    X2 = f_D(X, 10000, 1000, true);

    error = (X(7) - X2(7)) / (0.01 * X2(7));
    fprintf("error %.1f%% d = %.2f\n", error, X2(7));

    X = X2;
end
