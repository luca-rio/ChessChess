'use client'
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

    const ChessWithComputer = ({color}) => {

  const [game, setGame] = useState(new Chess());
  const [isHumanTurn, setIsHumanTurn] = useState(color=='white');

  function makeRandomMove() {
    const possibleMoves = game.moves({ verbose: true });
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;
    const currentPlayerColor = game.turn();
    const filteredMoves = possibleMoves.filter(move => move.color !== currentPlayerColor);
    const movesToConsider = filteredMoves.length > 0 ? filteredMoves : possibleMoves;

    if (movesToConsider.length > 0) {
        const delay = Math.floor(Math.random() * 1000) + 1250; // Random delay between 1000ms and 2000ms (1-2 seconds)
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * movesToConsider.length);
          const randomMove = movesToConsider[randomIndex];
          const { game: updatedGame } = makeAMove(game, { from: randomMove.from, to: randomMove.to, promotion: "q" });
          setGame(updatedGame);
          setIsHumanTurn(true);
        }, delay);
    }
  }

  function makeAMove(game, move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    return { game: gameCopy, result };
  }

  function onDrop(sourceSquare, targetSquare) {
    const { game: updatedGame, result } = makeAMove(game, { from: sourceSquare, to: targetSquare, promotion: "q" });
    if (result === null) return false;
    setGame(updatedGame);
    setIsHumanTurn(false);
    console.log(isHumanTurn);
    return true;
  }

  function makeComputerMove() {
    makeRandomMove();
  }
  
  useEffect(() => {
    if (!isHumanTurn) {
      makeComputerMove();
    }
  }, [isHumanTurn]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        <Chessboard boardOrientation={color} boardWidth={560 * 1.15} position={game.fen()} onPieceDrop={onDrop} />
      </div>
    </div>
  );
}

export default ChessWithComputer;