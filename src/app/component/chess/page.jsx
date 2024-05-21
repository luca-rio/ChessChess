'use client'
import React, { useState } from 'react';
import ChessWithComputer from './computer/page';
import { Card, Paper, Button, Grid} from '@mui/material';
import Online from './online/page';

export default function GameMenu() {
  const [gameMode, setGameMode] = useState(null);
  const [color,setColor] = useState('white');
  const [colorChoice, setColorChoice] = useState(null);
  const [onlineChoice, setOnlineChoice] = useState(null);
  const [code, setCode] = useState('')
  const [roomId, setRoomId] = useState('');

  const handleRoomIdChange = (newRoomId) => {
    setRoomId(newRoomId);
    // You can now use the roomId value in the parent component
    console.log('Room ID received from child:', newRoomId);
  };

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
  };
  const handlePlayC = (color) =>{
    setColor(color);
    handleGameModeSelect('computer');
  }
  const handlePlayO = () =>{
    handleGameModeSelect('online');

  }
  const handleColorChoice = () =>{
    setColorChoice(true);
  }
  const handleOnlinChoice = () =>{
    setOnlineChoice(true);
  }
  return (
    <div>
      {gameMode === null && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card>
                <Paper>
                    <Grid container direction="column" justifyContent="center" alignItems="center" padding={1}>
                        <Grid item xs={12}>
                        {roomId ? null : colorChoice ? (
                            <Grid container justifyContent="center">
                              <Grid item>
                                <Button onClick={() => handlePlayC('white')}>Play as White</Button>
                              </Grid>
                              <Grid item>
                                <Button onClick={() => handlePlayC('black')}>Play as Black</Button>
                              </Grid>
                            </Grid>
                          ) : (
                            <Button onClick={() => handleColorChoice()}>Play Computer</Button>
                          )}
                       
                        </Grid>
                        <Grid item xs={12}>
                            {onlineChoice 
                            ? (
                              <Online onRoomIdChange={handleRoomIdChange}/>
                            ) 
                            : (<Button onClick={()=> handleOnlinChoice()}>Play Online</Button>)}
                        </Grid>
                    </Grid>
                </Paper>
            </Card>
        </div>
      )}
      {gameMode === 'computer' && <ChessWithComputer color={color} />}
    </div>
  );
}