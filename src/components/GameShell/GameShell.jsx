import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";

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
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  
  const navigate = useNavigate();

  const pauseBtnRef = useRef(null);
  const resumeBtnRef = useRef(null);
  const restartBtnRef = useRef(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Update best score automatically when score increases
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore]);

  // Comprehensive Focus Lifecycle, Trapping, and Restoration
  useEffect(() => {
    if (paused || gameOver) {
      triggerRef.current = document.activeElement;

      // Initial focus inside modal
      if (paused && resumeBtnRef.current) {
        resumeBtnRef.current.focus();
      } else if (gameOver && restartBtnRef.current) {
        restartBtnRef.current.focus();
      }

      // Trap focus inside modal
      const currentModal = modalRef.current;
      if (currentModal) {
        const handleKeyDown = (e) => {
          if (e.key !== 'Tab') return;
          const focusables = currentModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    } else {
      // Restore focus to trigger element when modal closes
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    }
  }, [paused, gameOver]);

  const restartGame = () => {
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