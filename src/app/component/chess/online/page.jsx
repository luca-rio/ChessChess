'use client'
import React, { useState, useEffect, useCallback ,useMemo } from 'react';
import io from 'socket.io-client';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Card, Paper, Stack, Button, Grid , InputBase , Divider, IconButton ,TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Online = ({onRoomIdChange}) => {
  const [state, setState] = useState({
    socket: null,
    game: new Chess(),
    roomId: '',
    tempRoomId:'',
    gameHasStarted: false,
    gameOver: false,
    color: '',
    board: new Chess().fen()
  });

  const memoizedRoomId = useMemo(() => state.roomId, [state.roomId]);

  useEffect(() => {
    if (onRoomIdChange && memoizedRoomId) {
      onRoomIdChange(memoizedRoomId);
    }
  }, [memoizedRoomId, onRoomIdChange]);

  useEffect(() => {
    const socket = io('https://continuous-woozy-poultry.glitch.me/');
    setState((prev) => ({ ...prev, socket }));

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setState((prev) => ({ ...prev, socket: null }));
    });

    socket.on('gameCreated', ({ roomId, color }) => {
      setState((prev) => ({ ...prev, roomId, color }));
    });

    socket.on('gameStarted', ({ roomId, color }) => {
      setState((prev) => ({ ...prev, gameHasStarted: true, roomId, color }));
    });

    socket.on('playerDisconnected', () => {
      setState((prev) => ({ ...prev, gameOver: true }));
    });

    socket.on('gameError', (error) => {
      console.error(error);
    });

    socket.on('newMove', (move) => {
      state.game.move({ from: move.from, to: move.to });
      setState((prev) => ({ ...prev, game: state.game, board: state.game.fen() }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const makeAMove = useCallback(
    (game, move) => {
      if (!state.socket) return;
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        state.socket.emit('move', { move, roomId: state.roomId });
        setState((prev) => ({ ...prev, game: gameCopy, board: gameCopy.fen() }));
      }
      return { game: gameCopy, result };
    },
    [state.socket, state.roomId]
  );

  const onDrop = (sourceSquare, targetSquare) => {
    if (!state.socket) return false;
    const piece = state.game.get(sourceSquare);
    if (piece.color[0] === state.color[0]) {
    const move = { from: sourceSquare, to: targetSquare, promotion: 'q' };
    const { game: updatedGame, result } = makeAMove(state.game, move);
    if (!result) return false;
    setState((prev) => ({ ...prev, game: updatedGame, board: updatedGame.fen() }));
    return true;}
  };


  const createGame = () => {
    if (state.socket) {
      state.socket.emit('createGame', { color: 'white' });
    }
  };

  const joinGame = (tempRoomId) => {
    const roomId = tempRoomId;
    if (roomId && state.socket) {
      state.socket.emit('joinGame', { roomId });
    }
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        {!state.roomId ? (
          <>
         <Grid container justifyContent="center" alignItems="center" sx={{ width: "100%" }}>
  {/* Host a game button */}
  <Grid xs='auto' item>
    <Button onClick={createGame}>Host a game</Button>
  </Grid>

  <Grid xs container justifyContent="center" alignItems="center" className='hover:bg-opacity-25 hover:bg-blue-100 focus:bg-opacity-25 focus:bg-blue-100 active:bg-opacity-25 active:bg-blue-100' style={{width:"fit-content"}}>
    <Grid item xs={4}>
      <InputBase
        placeholder="Join game"
        inputProps={{ 'aria-label': 'search google maps' }}
        value={state.tempRoomId}
        onChange={(e) => setState(prevState => ({ ...prevState, tempRoomId: e.target.value }))}
      />
    </Grid>

    <Grid item xs={1}>
      <Divider sx={{ height: 28, mx: 1 }} orientation="vertical" />
    </Grid>

    <Grid item xs={2}>
      <IconButton
        color="primary"
        sx={{ p: 1 }}
        aria-label="search"
        onClick={() => joinGame(state.tempRoomId)}
      >
        <SearchIcon />
      </IconButton>
    </Grid>
  </Grid>
</Grid>

          </>
        ) : (
          <>
            <div>
              Room ID: {state.roomId} Color: {state.color}
            </div>
            {state.gameHasStarted || (state.roomId && !state.gameOver) ? (
              <Chessboard
                boardWidth={560 * 0.6}
                onPieceDrop={onDrop}
                boardOrientation={state.color}
                position={state.game.fen()}
              />
            ) : (
              <p>Waiting for game details...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Online;