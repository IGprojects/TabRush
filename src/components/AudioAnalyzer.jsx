import React, { useEffect, useRef, useState } from 'react';
// import * as ml5 from 'ml5'; // Using CDN

const AudioAnalyzer = ({ onNoteDetected }) => {
    const [status, setStatus] = useState('Initializing...');
    const audioContextRef = useRef(null);
    const pitchRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const startAudio = async () => {
            try {
                setStatus('Requesting Mic...');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                streamRef.current = stream;

                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

                setStatus('Loading Model...');
                // Using CDN for the model
                const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
                const pitch = window.ml5.pitchDetection(modelUrl, audioContextRef.current, stream, modelLoaded);
                pitchRef.current = pitch;

            } catch (err) {
                console.error(err);
                setStatus('Error: ' + err.message);
            }
        };

        startAudio();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const modelLoaded = () => {
        setStatus('Ready');
        getPitch();
    };

    const getPitch = () => {
        if (!pitchRef.current) return;

        pitchRef.current.getPitch((err, frequency) => {
            if (frequency) {
                onNoteDetected(frequency);
            }
            // Recursively call to keep listening
            if (streamRef.current && streamRef.current.active) {
                requestAnimationFrame(getPitch);
            }
        });
    };

    return (
        <div className="audio-analyzer-status" style={{ display: 'none' }}>
            <p>Audio Status: {status}</p>
        </div>
    );
};

export default AudioAnalyzer;
