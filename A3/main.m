d = 85;
V = 12.81;
I = pi * d^4 / 64;


r = d/2;
A = pi * r^2;


yhat = [linspace(r, 0, 50), linspace(0, -r, 50)];
Q = yhat * A;

x = [linspace(r, 0, 50), linspace(0, r, 50)];
y = linspace(0, d, 100);
t = sqrt(r^2 - x.^2)*2;

shear = V .* Q ./ (I .* t);
plot(y, shear);
xlabel("y");
ylabel("shear stress");
% plot(y, t); 

