import React from 'react';
import { useMemo } from 'react';

const BackgroundBubbles: React.FC = () => {
    const bubbles = useMemo(() => Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 8 + 2; // size in rem (2rem to 10rem)
        const duration = Math.random() * 20 + 15; // 15s to 35s
        const delay = Math.random() * -20; // -20s to 0s
        const left = Math.random() * 100;
        return {
            id: i,
            style: {
                width: `${size}rem`,
                height: `${size}rem`,
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
            },
        };
    }), []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
            <style>
                {`
                @keyframes animateBubble {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                        border-radius: 20%;
                    }
                    100% {
                        transform: translateY(-120vh) rotate(720deg);
                        opacity: 0;
                        border-radius: 50%;
                    }
                }
                .bubble {
                    position: absolute;
                    bottom: -200px;
                    background: rgba(192, 132, 252, 0.05); /* subtle purple bubble */
                    border-radius: 50%;
                    animation: animateBubble linear infinite;
                }
                `}
            </style>
            {bubbles.map(bubble => (
                <div key={bubble.id} className="bubble" style={bubble.style}></div>
            ))}
        </div>
    );
};

export default BackgroundBubbles;