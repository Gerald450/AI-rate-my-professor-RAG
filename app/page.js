'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Stack, TextField, Typography, useTheme } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the rate my professor support assistant. How can I help you today?"
    }
  ]);

  const [message, setMessage] = useState('');
  const theme = useTheme();
  const messagesEndRef = useRef(null); 

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      {
        role: 'user',
        content: message,
      },
      {
        role: 'assistant',
        content: ''
      },
    ]);
    setMessage('');

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + chunk }
        ];
      });
    }
  };

  return (
    <Box 
      width='100%' 
      height='100vh' 
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      padding={2}
      bgcolor={theme.palette.background.default}  
      color={theme.palette.text.primary} 
    >
      <Stack 
        direction='column' 
        width='100%' 
        maxWidth='800px' 
        height='90vh' 
        border={`1px solid ${theme.palette.divider}`} 
        borderRadius={8} 
        p={3} 
        spacing={3}
        boxShadow={3} 
        sx={{
          '@media (max-width: 600px)': { 
            width: '95%',
            height: '80vh',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888', 
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
          },
        }}
      >
        <Stack 
          direction='column' 
          spacing={2} 
          flexGrow={1}
          overflow='auto'
          maxHeight={'100%'}
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display='flex' 
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box 
                bgcolor={message.role === 'assistant' ? theme.palette.primary.main : theme.palette.secondary.main} 
                color={theme.palette.primary.contrastText}
                borderRadius={16}
                p={2} 
                whiteSpace='pre-wrap' 
                maxWidth="75%" 
              >
                <Typography variant="body1"> 
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} /> 
        </Stack>
        <Stack
          direction='row'
          spacing={2}
        >
          <TextField
            label='Message'
            fullWidth 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            sx={{
              flexGrow: 1,
              '@media (max-width: 600px)': {
                width: '70%',
              },
            }}
          />
          <Button
            variant='contained'
            color='primary' 
            onClick={sendMessage}
            sx={{
              '@media (max-width: 600px)': {
                flexGrow: 1,
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
