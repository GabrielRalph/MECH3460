classdef PlotImage
    % PlotImage, make inference from plots provided as images. A plot must
    % contain one blue (#0000FF) pixel at the plot origin and one green
    % pixel (#00FF00) at the top right corner of the plot. A signal must be
    % made up of saturated coloured pixels (except blue and green)
    % and multiple signals can be created using different colours (hues). 
    
    properties
        pixelpoints
        rangestart
        rangeend 
        pixelstart
        pixelend
        imgsrc
        width
        height
    end
    
    methods
        % Extract coloured pixels from an image of a graph, the first blue
        % pixel (#0000FF) will be used as the origin of the plot and the 
        % first green pixel (#00FF00) the end (top right corner) of plot.
        % All pixels with a saturation and value above a threshold are
        % used to create the signal points, sorted into 34 signals by the 
        % hue (excluding blue, green). Pixel coordinates will then be 
        % transfromed to the range of the plot provided.
        function obj = PlotImage(pimg, rstart, rend)
            [obj.height, obj.width, ~] = size(pimg);
            hsv36 = round(rgb2hsv(pimg) * 36);
            svth = 20;
            
            pstart = [];
            pend = [];
            sppoints = {};

            % Extract pixels points of the 36 hues for pixels with
            % saturation and value greater then a threshold (svth)
            
            for i = 0:36
                cset = hsv36(:, :, 1) == i & hsv36(:, :, 2) > svth & hsv36(:, :, 3) > svth;
                pidxs = find(cset);
                
                if ~isempty(pidxs)
                    [h, w] = size(cset);
                    y = mod(pidxs - 1, h) + 1;
                    x = floor(pidxs / h);
    
                    if i == 24      % origin    blue
                        pstart = [x(1), y(1)];
                    elseif i == 12  % endpoint  green
                        pend = [x(1), y(1)];
                    else % signals
                        cy = zeros(w, 1);
                        for xi = 1:w
                            cy(xi) = round(mean(y(x == xi)));
                        end
                        sppoints{end+1} = cy;
                    end
                end
            end
            snum = length(sppoints);
            ppoints = ones(w, snum);
            for i = 1:snum
                ppoints(:, i) = sppoints{i};
            end
            obj.pixelpoints = ppoints;
            obj.pixelend = pend;
            obj.pixelstart = pstart;
            obj.rangestart = rstart;
            obj.rangeend = rend;
%             % transform pixel dimensions to plot range
%             if ~isempty(pend) && ~isempty(pstart) && ~isempty(sppoints)
%                 n = length(sppoints);
%                 sigpoints = cell(n, 1);
%                 for i = 1:n
%                     sps = sppoints{i};
%                     pnorm = (sps - pstart) ./ (pend - pstart);
%                     sigpoints{i} = rstart + (rend - rstart) .* pnorm;
%                 end
%                 obj.signalpoints = sigpoints;
%                 obj.incs = (rend - rstart) ./ abs(pend - pstart);
%             end

%             obj.axislimits = [rstart(1), rend(1), rstart(2), rend(2)];
        end
        
        % Plot signal points
        function plot(obj)
%             sigs = obj.signalpoints;
%             for i = 1:length(sigs)
%                 sig = sigs{i};
%                 [ux, ~, uxi] = uniquetol(sig(:, 1), obj.incs(1) / 10);
%                 uy = accumarray(uxi, sig(:, 2)) ./ accumarray(uxi, 1);
%                 scatter(sig(:, 1), sig(:, 2), 20, 'black', 'filled');
%                 hold on;
%                 plot(ux, uy);
%                 hold on;
%                 p = ransacpoly(sig(:, 1),sig(:, 2), 9)
%                 px = linspace(min(ux),  max(ux), 100);
%                 plot(px, polyval(p, px));
%             end
%             grid on;
%             hold off;
%             axis(obj.axislimits);
        end
        
%         % Infer y from x, for all signals returns the average y
%         % coordinate for points whose x coordinates were no  
%         % more the minimum x increment away from the given x value to 
%         % infer y from.
%         function y = yinfer(obj, x)
%             sigs = obj.signalpoints;
%             n = length(x);
%             y = zeros(length(sigs), n);
%             for i = 1:length(sigs)
%                 points = sigs{i};
%                 for j = 1:n
%                     ipoints = points(abs(points(:, 1) - x(j)) < obj.incs(1), :);
%                     center = mean(ipoints);
%                     y(i, j) = center(2);
%                 end
%             end
%         end
%     
%         % Infer x from y
%         function x = xinfer(obj, y)
%             sigs = obj.signalpoints;
%             n = length(y);
%             x = zeros(length(sigs), n);
%             for i = 1:length(sigs)
%                 points = sigs{i};
%                 for j = 1:n
%                     ipoints = points(abs(points(:, 2) - y(j)) < obj.incs(2), :);
%                     center = mean(ipoints);
%                     x(i, j) = center(1);
%                 end
%             end
%         end
    end
end

