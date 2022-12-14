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

    properties (Access = private)
        image
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
            obj.image = pimg;
            [obj.height, obj.width, ~] = size(pimg);
            hsv36 = round(rgb2hsv(pimg) * 36);
            svth = 20;
            
            pstart = [];
            pend = [];
            sppoints = [];

            % Extract pixels points of the 36 hues for pixels with
            % saturation and value greater then a threshold (svth)
            for i = 0:36
                cset = hsv36(:, :, 1) == i & hsv36(:, :, 2) > svth & hsv36(:, :, 3) > svth;
                pidxs = find(cset);
                
                if ~isempty(pidxs)%length(pidxs) > 10
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
                        
                        pnans = length(find(isnan(cy))) / w;
                        if pnans < 0.8
                            if ~isempty(sppoints)
                                sppoints = cat(2, sppoints, cy);
                            else
                                sppoints = cy;
                            end
                        end
                    end
                end
            end
            obj.pixelpoints = sppoints;
            obj.pixelend = pend;
            obj.pixelstart = pstart;
            obj.rangestart = rstart;
            obj.rangeend = rend;
        end
        
        % Plot signal points
        function plot(obj)
            sigs = obj.pixelpoints;
%             imshow(obj.image);
            x = (1:obj.width)';
            hold on;
            plot(x, sigs, 'LineWidth',3);
        end

        function saveJSON(obj, filename, imgsrc)
            fid = fopen(filename, "w+");
            obj.imgsrc = imgsrc;
            text = jsonencode(obj);
            fprintf(fid, "%s\n", text);
            fclose(fid);
        end
    end
end

