import React, { useRef, useEffect } from 'react';

const Fretboard = ({ songData, currentTime, detectedNote }) => {
    const canvasRef = useRef(null);

    // Refs for animation loop to avoid re-running useEffect
    const songDataRef = useRef(songData);
    const currentTimeRef = useRef(currentTime);
    const detectedNoteRef = useRef(detectedNote);

    // Update refs whenever props change
    useEffect(() => {
        songDataRef.current = songData;
        currentTimeRef.current = currentTime;
        detectedNoteRef.current = detectedNote;
    }, [songData, currentTime, detectedNote]);

    // Constants for Horizontal Layout
    const STRINGS = 6;
    const NOTE_SPEED = 300; // Pixels per second
    const HIT_POSITION_X = 100; // X position of the hit line (from left)

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Responsive Canvas Size
        const updateCanvasSize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize(); // Initial size

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Read current values from refs
            const currentSongData = songDataRef.current;
            const time = currentTimeRef.current;
            // const note = detectedNoteRef.current; // Unused for now in visualizer logic but available

            // Clear Canvas
            ctx.clearRect(0, 0, width, height);

            // Draw Background
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, width, height);

            // Draw Strings (Horizontal Lines)
            const stringSpacing = height / (STRINGS + 1);
            for (let i = 0; i < STRINGS; i++) {
                const y = stringSpacing * (i + 1);

                // String Color (Standard Guitar Heroish colors)
                const colors = ['#00FF00', '#FF0000', '#FFFF00', '#0000FF', '#FFA500', '#800080']; // E A D G B e
                ctx.strokeStyle = colors[i]; // Use specific color for each string
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw Hit Line (Vertical Line on Left)
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(HIT_POSITION_X, 0);
            ctx.lineTo(HIT_POSITION_X, height);
            ctx.stroke();

            // Draw Hit Zone Glow
            const gradient = ctx.createLinearGradient(HIT_POSITION_X - 20, 0, HIT_POSITION_X + 20, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(HIT_POSITION_X - 20, 0, 40, height);


            // Draw Notes
            // Notes move from Right to Left
            // x = HIT_POSITION_X + (noteTime - currentTime) * NOTE_SPEED

            if (currentSongData) {
                // Optimization: Only draw notes that are on screen
                // We can iterate all for now as drawing is cheap, but logic optimization is in App.jsx
                // For rendering, simple bounds check is enough

                currentSongData.forEach(note => {
                    const timeDiff = note.time - time;
                    const x = HIT_POSITION_X + (timeDiff * NOTE_SPEED);
                    const y = stringSpacing * (note.string + 1); // 0-indexed string in data

                    // Only draw if on screen (with some buffer)
                    if (x > -50 && x < width + 50) {
                        ctx.beginPath();
                        ctx.arc(x, y, 12, 0, 2 * Math.PI);

                        // Color based on string
                        const colors = ['#00FF00', '#FF0000', '#FFFF00', '#0000FF', '#FFA500', '#800080'];
                        ctx.fillStyle = colors[note.string] || 'white';

                        ctx.fill();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'white';
                        ctx.stroke();

                        // Fret Number
                        ctx.fillStyle = 'black';
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(note.fret, x, y);
                    }
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Empty dependency array = runs once on mount

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
};

export default Fretboard;
