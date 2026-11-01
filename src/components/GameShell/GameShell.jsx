import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { bestScoreKey, toSafeBest } from "../../utils/bestScore";

const GameShellContext = createContext(null);

export const useGameShell = () => {
  const context = useContext(GameShellContext);
  if (!context) {
    throw new Error('useGameShell must be used within a GameShell provider');
  }
  return context;
};

export default function GameShell({ title, children }) {
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [storedBest, setBest] = useLocalStorage(bestScoreKey(title), 0);
  const best = toSafeBest(storedBest);

  const handleSetScore = useCallback(
    (val) => {
      const newScore = typeof val === "function" ? val(score) : val;
      setScore(newScore);
      if (newScore > best) setBest(newScore);
    },
    [score, best, setBest],
  );

  const handleSetGameOver = useCallback((val) => {
    setGameOver(val);
    if (val) setPaused(true);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  const value = {
    score,
    setScore,
    bestScore,
    setBestScore,
    gameOver,
    setGameOver,
    paused,
    setPaused,
    restartGame,
  };

  return (
    <GameShellContext.Provider value={value}>
      <SShell>
        <STopBar>
          <STitle>{title}</STitle>
          <SScoreBoard>
            <span>Score: {score}</span>
            <span>Best: {bestScore}</span>
          </SScoreBoard>
          <SControls>
            <SBtn
              ref={pauseBtnRef}
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Resume game" : "Pause game"}
              aria-pressed={paused}
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </SBtn>
            <SBtn
              onClick={() => setMuted(!muted)}
              aria-label={muted ? "Unmute audio" : "Mute audio"}
              aria-pressed={muted}
            >
              {muted ? "🔇 Unmute" : "🔊 Mute"}
            </SBtn>
            <SBackBtn to="/" aria-label="Return to Games list">
              ← Games
            </SBackBtn>
          </SControls>
        </STopBar>

        <SContent aria-hidden={paused || gameOver}>
          {children}
        </SContent>

        {paused && !gameOver && (
          <SPausedOverlay>
            <SPausedCard 
              role="dialog" 
              aria-modal="true" 
              aria-label="Game Paused"
              ref={modalRef}
            >
              <SPausedTitle>GAME PAUSED</SPausedTitle>
              <p>Current Score: {score}</p>
              <p>Best Score: {bestScore}</p>
              <SResumeBtn
                ref={resumeBtnRef}
                onClick={() => setPaused(false)}
                aria-label="Resume game"
              >
                Resume Game
              </SResumeBtn>
            </SPausedCard>
          </SPausedOverlay>
        )}

        {gameOver && (
          <SModalOverlay>
            <SModal 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="game-over-title"
              ref={modalRef}
            >
              <SModalTitle id="game-over-title">GAME OVER</SModalTitle>
              <p>Final Score: {score}</p>
              <p>Best Score: {bestScore}</p>
              <SModalActions>
                <SPrimaryBtn
                  ref={restartBtnRef}
                  onClick={restartGame}
                  aria-label="Restart game"
                >
                  Play Again
                </SPrimaryBtn>
                <SSecondaryBtn onClick={() => navigate("/")}>
                  Back to Catalog
                </SSecondaryBtn>
              </SModalActions>
            </SModal>
          </SModalOverlay>
        )}
      </SShell>
    </GameShellContext.Provider>
  );
}

const SShell = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.space[4]}px;
  position: relative;
`;

const STopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.space[4]}px;
  flex-wrap: wrap;
  gap: 1rem;
`;

const STitle = styled.h1`
  font-family: ${theme.font.display};
  font-size: 1.5rem;
  color: ${theme.colors.text};
  margin: 0;
`;

const SScoreBoard = styled.div`
  display: flex;
  gap: 1rem;
  font-family: ${theme.font.mono};
  color: ${theme.colors.text};
  background: ${theme.colors.surfaceAlt};
  padding: 6px 12px;
  border-radius: ${theme.radius.sm};
  border: 1px solid ${theme.colors.border};
`;

const SControls = styled.div`
  display: flex;
  gap: ${theme.space[2]}px;
  align-items: center;
`;

const SBtn = styled.button`
  background: ${theme.colors.surfaceAlt};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  padding: 6px 12px;
  cursor: pointer;
  font-family: ${theme.font.mono};

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SBackBtn = styled(Link)`
  color: ${theme.colors.textMuted};
  text-decoration: none;
  padding: 6px 12px;
  border-radius: ${theme.radius.sm};

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SContent = styled.div`
  position: relative;
`;

const SPausedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const SPausedCard = styled.div`
  background: ${theme.colors.surface};
  padding: 2rem;
  border-radius: ${theme.radius.md};
  text-align: center;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
`;

const SPausedTitle = styled.h2`
  font-family: ${theme.font.display};
  margin-bottom: 1rem;
`;

const SResumeBtn = styled.button`
  background: ${theme.colors.accent};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: ${theme.radius.sm};
  cursor: pointer;
  margin-top: 1rem;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const SModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const SModal = styled.div`
  background: ${theme.colors.surface};
  padding: 2.5rem;
  border-radius: ${theme.radius.md};
  text-align: center;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
`;

const SModalTitle = styled.h2`
  font-family: ${theme.font.display};
  margin-bottom: 1.5rem;
`;

const SModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const SPrimaryBtn = styled.button`
  background: ${theme.colors.accent};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: ${theme.radius.sm};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const SSecondaryBtn = styled.button`
  background: transparent;
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  padding: 10px 20px;
  border-radius: ${theme.radius.sm};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;