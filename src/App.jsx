import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { parseTab } from './utils/tabParser';
import { isHit } from './utils/noteUtils';
import { generateTabFromAudio } from './utils/autoTabber';
import { getHistory, saveGame } from './utils/storage';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import AudioAnalyzer from './components/AudioAnalyzer';
import Fretboard from './components/Fretboard';
import Login from './components/Login';
import Profile from './components/Profile';
import { DEMO_SONGS } from './data/songs';
import { auth } from './firebase';
import logo from './assets/LOGO_TABRUSH-removebg.png';

function App() {
    const [gameState, setGameState] = useState('menu'); // menu, playing, results
    const [currentTime, setCurrentTime] = useState(0);
    const [detectedFreq, setDetectedFreq] = useState(0);
    const [startTime, setStartTime] = useState(0);

    // Game Logic State
    const [score, setScore] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [hitNotes, setHitNotes] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [processedNotes, setProcessedNotes] = useState(new Set()); // Track notes already hit/missed
    const nextNoteIndexRef = useRef(0); // Optimization: Track next note to check

    // Song Selection State
    const [selectedSongId, setSelectedSongId] = useState(DEMO_SONGS[0].id);
    const [currentSongData, setCurrentSongData] = useState(null);
    const [customAudioFile, setCustomAudioFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null); // Auth User
    const [isGuest, setIsGuest] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [menuView, setMenuView] = useState('main'); // main, library, custom

    const audioRef = useRef(null);

    // Load local history on mount
    useEffect(() => {
        setHistory(getHistory());
    }, []);

    // Load cloud history when user logs in
    useEffect(() => {
        const loadCloudHistory = async () => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.history) {
                            // Merge local and cloud history (simple merge)
                            setHistory(prev => {
                                const combined = [...prev, ...data.history];
                                // Deduplicate by ID
                                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                                return unique.sort((a, b) => new Date(b.date) - new Date(a.date));
                            });
                        }
                    }
                } catch (e) {
                    console.error("Error loading cloud history:", e);
                }
            }
        };
        loadCloudHistory();
    }, [user]);

    const handleSongSelect = (e) => {
        setSelectedSongId(e.target.value);
        setCustomAudioFile(null); // Reset custom audio if picking a demo
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'audio') {
            setCustomAudioFile(URL.createObjectURL(file));
            // If uploading audio, we might want to switch to a "custom" mode or just let them play
        } else if (type === 'tab') {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = parseTab(event.target.result);
                    // Create a temporary custom song object
                    const customSong = {
                        id: 'custom',
                        title: 'Custom Song',
                        artist: 'Unknown',
                        tabData: parsed
                    };
                    setCurrentSongData(customSong);
                    setSelectedSongId('custom');
                } catch (err) {
                    alert('Failed to parse tab file!');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        } else if (type === 'auto-tab') {
            setIsProcessing(true);
            // 1. Set Audio
            setCustomAudioFile(URL.createObjectURL(file));

            // 2. Generate Tab
            generateTabFromAudio(file).then(notes => {
                const customSong = {
                    id: 'custom-auto',
                    title: 'Auto-Generated Song',
                    artist: 'Unknown',
                    tabData: notes
                };
                setCurrentSongData(customSong);
                setSelectedSongId('custom');
                setIsProcessing(false);
                alert(`Generated ${notes.length} notes! Click Start to play.`);
            }).catch(err => {
                console.error(err);
                alert('Failed to generate tab from audio.');
                setIsProcessing(false);
            });
        }
    };

    const startGame = () => {
        let songToPlay;

        if (selectedSongId === 'custom') {
            if (!currentSongData) {
                alert("Please upload a tab file for custom song!");
                return;
            }
            songToPlay = currentSongData;
        } else {
            songToPlay = DEMO_SONGS.find(s => s.id === selectedSongId);
        }

        startSong(songToPlay);
    };

    const startSong = (songToPlay) => {
        setCurrentSongData(songToPlay);
        setScore(0);
        setHitNotes(0);
        setTotalNotes(songToPlay.tabData.length);
        setProcessedNotes(new Set());
        nextNoteIndexRef.current = 0;
        setGameState('playing');
        setStartTime(Date.now());

        // If there's an audio element (custom audio), play it
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play();
        }
    };

    const startPracticeMode = () => {
        const randomSong = DEMO_SONGS[Math.floor(Math.random() * DEMO_SONGS.length)];
        setSelectedSongId(randomSong.id);
        startSong(randomSong);
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    // Game Loop (Optimized)
    useEffect(() => {
        let animationFrameId;

        const loop = () => {
            if (gameState !== 'playing') return;

            let newTime;
            if (audioRef.current && !audioRef.current.paused) {
                // Sync with audio
                newTime = audioRef.current.currentTime;
            } else {
                // Fallback to timer
                newTime = (Date.now() - startTime) / 1000 * playbackSpeed;
            }
            setCurrentTime(newTime);

            // Check for Hits (Optimized)
            if (currentSongData) {
                const HIT_WINDOW = 0.15; // 150ms window
                const notes = currentSongData.tabData;

                // Start checking from the last known index
                let startIndex = nextNoteIndexRef.current;

                // Optimization: Don't iterate everything. 
                // Stop when notes are too far in the future.
                for (let i = startIndex; i < notes.length; i++) {
                    const note = notes[i];

                    // If note is far in the past (missed and processed), move start index
                    if (newTime > note.time + HIT_WINDOW + 0.5) {
                        if (!processedNotes.has(i)) {
                            // Should have been marked as miss already, but just in case
                            // We update the ref to skip this note next time
                            nextNoteIndexRef.current = i + 1;
                        }
                        continue;
                    }

                    // If note is too far in the future, stop checking
                    if (note.time > newTime + HIT_WINDOW + 0.5) {
                        break;
                    }

                    if (processedNotes.has(i)) continue;

                    const timeDiff = Math.abs(note.time - newTime);

                    // If within window, check pitch
                    if (timeDiff <= HIT_WINDOW) {
                        if (isHit(detectedFreq, note.string, note.fret)) {
                            setScore(s => s + 100);
                            setHitNotes(h => h + 1);
                            setProcessedNotes(prev => {
                                const newSet = new Set(prev);
                                newSet.add(i);
                                return newSet;
                            });
                            console.log("HIT!");
                        }
                    }
                    // If missed (passed time)
                    else if (newTime > note.time + HIT_WINDOW) {
                        setProcessedNotes(prev => {
                            const newSet = new Set(prev);
                            newSet.add(i);
                            return newSet;
                        });
                        console.log("MISS!");
                        // We can safely advance the index since this note is done
                        nextNoteIndexRef.current = i + 1;
                    }
                }

                // Check for Song End
                const lastNoteTime = notes[notes.length - 1].time;
                if (newTime > lastNoteTime + 2.0) {
                    const percentage = (hitNotes / totalNotes) * 100 || 0;
                    const grade = getGrade(percentage);

                    // Save to History (Local + Cloud)
                    const gameData = {
                        songTitle: currentSongData.title,
                        score,
                        grade,
                        percentage: Math.round(percentage)
                    };

                    // 1. Local Save
                    const updatedHistory = saveGame(gameData);
                    setHistory(updatedHistory);

                    // 2. Cloud Save (if logged in)
                    if (user) {
                        try {
                            const userRef = doc(db, "users", user.uid);
                            // Create doc if not exists, then update
                            setDoc(userRef, {
                                email: user.email,
                                displayName: user.displayName
                            }, { merge: true });

                            updateDoc(userRef, {
                                history: arrayUnion({
                                    ...gameData,
                                    date: new Date().toISOString(),
                                    id: Date.now().toString()
                                })
                            });
                        } catch (e) {
                            console.error("Error saving to cloud:", e);
                        }
                    }

                    setGameState('results');
                }
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        if (gameState === 'playing') {
            loop();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, startTime, playbackSpeed, currentSongData, detectedFreq, processedNotes, hitNotes, totalNotes, score, user]);

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo-container">
                    <img src={logo} alt="TabRush Logo" className="app-logo" />
                    <h1>TabRush</h1>
                </div>
                {user && (
                    <div className="user-info" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <img src={user.photoURL} alt="User" className="user-avatar" />
                        <span>{user.displayName}</span>
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <button onClick={() => setGameState('profile')}>My Profile</button>
                                <button onClick={() => {
                                    auth.signOut();
                                    setUser(null);
                                    setIsGuest(false);
                                    setGameState('menu');
                                }}>Log Out</button>
                            </div>
                        )}
                    </div>
                )}
                {isGuest && <div className="user-info">
                    <span>Guest Mode</span>
                    <button className="btn-small" style={{ marginLeft: '10px', padding: '2px 8px' }} onClick={() => {
                        setIsGuest(false);
                        setUser(null);
                    }}>Exit</button>
                </div>}
            </header>

            <main>
                {!user && !isGuest ? (
                    <Login onLogin={(u) => {
                        if (u) {
                            setUser(u);
                        } else {
                            setIsGuest(true);
                        }
                    }} />
                ) : (
                    <>
                        {gameState === 'menu' && (
                            <div className="menu">
                                {menuView === 'main' && (
                                    <div className="mode-selection">
                                        <div className="mode-card" onClick={startPracticeMode}>
                                            <div className="mode-icon">🎲</div>
                                            <h3>Practice Mode</h3>
                                            <p>Random song to warm up!</p>
                                        </div>
                                        <div className="mode-card" onClick={() => setMenuView('library')}>
                                            <div className="mode-icon">🎸</div>
                                            <h3>Song Library</h3>
                                            <p>Choose from our collection</p>
                                        </div>
                                        <div className="mode-card" onClick={() => setMenuView('custom')}>
                                            <div className="mode-icon">📂</div>
                                            <h3>Custom Song</h3>
                                            <p>Upload your own tabs</p>
                                        </div>
                                    </div>
                                )}

                                {menuView === 'library' && (
                                    <div className="submenu">
                                        <button className="btn-small back-btn" onClick={() => setMenuView('main')}>← Back</button>
                                        <h2>Song Library</h2>
                                        <div className="menu-section full-width">
                                            <h3>Select a Song</h3>
                                            <select value={selectedSongId} onChange={handleSongSelect} className="song-select">
                                                {DEMO_SONGS.map(song => (
                                                    <option key={song.id} value={song.id}>
                                                        {song.title} - {song.artist} ({song.difficulty})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="menu-section full-width">
                                            <h3>Playback Speed</h3>
                                            <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))} className="song-select">
                                                <option value="0.5">0.5x (Slow)</option>
                                                <option value="0.75">0.75x (Practice)</option>
                                                <option value="1.0">1.0x (Normal)</option>
                                                <option value="1.25">1.25x (Fast)</option>
                                            </select>
                                        </div>

                                        <button className="btn-primary start-btn" onClick={startGame}>Start Rocking!</button>
                                    </div>
                                )}

                                {menuView === 'custom' && (
                                    <div className="submenu">
                                        <button className="btn-small back-btn" onClick={() => setMenuView('main')}>← Back</button>
                                        <h2>Custom Song</h2>
                                        <div className="menu-section full-width">
                                            <h3>Upload Files</h3>
                                            <div className="upload-group">
                                                <label>
                                                    Tabs (.json):
                                                    <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'tab')} />
                                                </label>
                                                <label>
                                                    Audio (.mp3/wav):
                                                    <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="menu-section full-width">
                                            <h3>Experimental: Auto-Tab from MP3</h3>
                                            <div className="upload-group horizontal">
                                                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'auto-tab')} disabled={isProcessing} />
                                                {isProcessing && <span className="loading-text">Analyzing...</span>}
                                            </div>
                                        </div>

                                        <button className="btn-primary start-btn" onClick={startGame}>Play Custom Song</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {gameState === 'profile' && user && (
                            <Profile
                                user={user}
                                history={history}
                                onBack={() => setGameState('menu')}
                                onLogout={() => {
                                    auth.signOut();
                                    setUser(null);
                                    setGameState('menu');
                                }}
                            />
                        )}

                        {gameState === 'history' && (
                            <div className="menu">
                                <h2>Score History</h2>
                                <div className="history-list">
                                    {history.length === 0 ? (
                                        <p>No games played yet.</p>
                                    ) : (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Song</th>
                                                    <th>Score</th>
                                                    <th>Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map(game => (
                                                    <tr key={game.id}>
                                                        <td>{new Date(game.date).toLocaleDateString()}</td>
                                                        <td>{game.songTitle}</td>
                                                        <td>{game.score}</td>
                                                        <td className={`grade-${game.grade}`}>{game.grade} ({game.percentage}%)</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <button className="btn-primary" onClick={() => setGameState('menu')}>Back to Menu</button>
                            </div>
                        )}

                        {gameState === 'results' && (
                            <div className="menu">
                                <h2>Song Finished!</h2>
                                <div className="results-stats">
                                    <p>Score: {score}</p>
                                    <p>Notes Hit: {hitNotes} / {totalNotes}</p>
                                    <h1 className="grade">Grade: {getGrade((hitNotes / totalNotes) * 100 || 0)}</h1>
                                </div>
                                <button className="btn-primary" onClick={() => setGameState('menu')}>Back to Menu</button>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <div className="game-container">
                                <div className="score-display">Score: {score}</div>
                                <AudioAnalyzer onNoteDetected={setDetectedFreq} />

                                {/* Hidden Audio Player */}
                                {customAudioFile && (
                                    <audio ref={audioRef} src={customAudioFile} />
                                )}

                                <Fretboard
                                    songData={currentSongData ? currentSongData.tabData : []}
                                    currentTime={currentTime}
                                    detectedNote={detectedFreq}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
