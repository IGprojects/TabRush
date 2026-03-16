import React from 'react';

const Profile = ({ user, history, onBack, onLogout }) => {
    // Calculate Stats
    const totalGames = history.length;
    const totalScore = history.reduce((acc, game) => acc + game.score, 0);
    const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

    // Calculate Average Percentage for Donut
    const totalPercentage = history.reduce((acc, game) => acc + (game.percentage || 0), 0);
    const avgPercentage = totalGames > 0 ? Math.round(totalPercentage / totalGames) : 0;

    // Donut Chart Style
    const donutStyle = {
        background: `conic-gradient(var(--neon-blue) ${avgPercentage * 3.6}deg, #333 0deg)`
    };

    return (
        <div className="menu profile-dashboard">
            <div className="profile-header">
                <img src={user.photoURL} alt="Profile" className="profile-avatar-large" />
                <h2>{user.displayName}</h2>
                <button className="btn-small logout-btn" onClick={onLogout}>Log Out</button>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <h3>Games Played</h3>
                    <p className="stat-value">{totalGames}</p>
                </div>

                <div className="stat-card donut-card">
                    <h3>Avg. Accuracy</h3>
                    <div className="donut-chart" style={donutStyle}>
                        <div className="donut-inner">
                            <span>{avgPercentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <h3>Avg. Score</h3>
                    <p className="stat-value">{avgScore}</p>
                </div>
            </div>

            <div className="history-section">
                <h3>Recent History</h3>
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
                                {history.slice(0, 10).map(game => ( // Show last 10
                                    <tr key={game.id}>
                                        <td>{new Date(game.date).toLocaleDateString()}</td>
                                        <td>{game.songTitle}</td>
                                        <td>{game.score}</td>
                                        <td className={`grade-${game.grade}`}>{game.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="profile-actions">
                <button className="btn-primary" onClick={onBack}>Back to Menu</button>
            </div>
        </div>
    );
};

export default Profile;
