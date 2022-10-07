function D = min_dia(Fs, Fy, Fr, Mq, Pq, Tq, D0, K, Ks, RPY, SSPY, PPTR)
    c1 = Mq + Pq * D0 / 8000;

    if SSPY <= 600
        if RPY <= 900
            D = (1e4 * Fs / Fy) * sqrt(c11^2 + (3/4)*Tq^2);
        else
            D = (1e4 * Fs / Fr) * sqrt((Ks * K * c1)^2 + (3/4)*Tq^2);
        end
    else
        if PPTR
            D = (1e4 * Fs / Fr) * K * Ks * sqrt(c1^2 + (3/4)*Tq^2);
        else
            D = (1e3 * Fs / Fr) * sqrt((Ks * K * c1)^2 + (3/16)*((1 + Ks*K) * Tq)^2);
        end
    end
    
    D = D^(1/3);
end

