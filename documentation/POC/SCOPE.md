# Channel Chat Scope Document: A YouTube Channel RAG Chat Application

## 1. Project Overview

Channel Chat is a YouTube channel RAG chat application is a frontend-only React app that allows users to "chat" with a YouTube channel using the YouTube Transcript Extraction Service and their chosen Large Language Model (LLM). The application implements a RAG-based (Retrieval-Augmented Generation) chat session, providing a user experience similar to ChatGPT's interface.

## 2. Objectives

- Create a user-friendly interface for interacting with YouTube channel content through natural language queries.
- Integrate with the YouTube Transcript Extraction Service for processing channel transcripts.
- Implement a configurable LLM integration for generating responses.
- Provide a customizable experience through a comprehensive settings sidebar.

## 3. Key Features

### 3.1 Main Chat Interface

- Input field for YouTube channel URL
- Text area for user queries
- Chat-like display for conversation history
- Progress indicators for transcript processing and response generation

### 3.2 Configuration Sidebar

- Collapsible sidebar with hamburger menu toggle
- API key management for OpenAI and other services
- Ollama endpoint configuration (default: http://localhost:11434/api/)
- Model management (list, add, select active model)
- Transcript and chunk limit settings
- Token limit configuration for responses
- Reset to defaults option

### 3.3 RAG-based Chat Functionality

- Integration with YouTube Transcript Extraction Service
- Dynamic context retrieval based on user queries
- LLM-powered response generation

## 4. Technical Specifications

### 4.1 Frontend Framework

- React (Create React App or Next.js)
- State management: React Context API or Redux
- Styling: Tailwind CSS or styled-components

### 4.2 External Integrations

- YouTube Transcript Extraction Service API
- OpenAI API (or alternative LLM APIs)
- Ollama API (for local model support)

### 4.3 Data Flow

1. User inputs YouTube channel URL
2. Application calls YouTube Transcript Extraction Service to process channel
3. User enters query
4. Application retrieves relevant chunks from processed transcripts
5. Retrieved chunks and user query are sent to LLM for response generation
6. Generated response is displayed in the chat interface

## 5. Detailed Component Specifications

### 5.1 Main Container

- **YouTube Channel Input:**
  - Text input field for channel URL
  - "Process Channel" button
  - Progress indicator for channel processing

- **Query Input:**
  - Text area for user queries
  - "Send" button
  - Disabled state when channel is not processed

- **Chat Display:**
  - Scrollable container
  - Alternating user and AI message bubbles
  - Markdown rendering for AI responses
  - Auto-scroll to bottom on new messages

### 5.2 Configuration Sidebar

- **Appearance and Interaction:**
  - Hamburger menu icon in top-left corner
  - Smooth slide-in animation from left
  - Dark background with white text
  - Sections with clear labels

- **API Key Management:**
  - Masked input field for OpenAI API key
  - Toggle visibility button (eye icon)
  - Secure storage of API key (e.g., localStorage with encryption)

- **Ollama Endpoint:**
  - Text input field for endpoint URL
  - Information tooltip explaining Ollama's purpose

- **Model Management:**
  - Checkboxes for enabling/disabling models
  - Input field and "Add" button for new models
  - Dropdown menu for selecting active model
  - Dynamic updating of dropdown based on available models

- **Transcript and Chunk Limits:**
  - Number input for transcript limit (range: 1-100)
  - Number input for chunk limit (range: 1-10)
  - Number input for token limit (range: 200-10000)
  - Validation and error messages for out-of-range inputs

- **Reset and Save:**
  - "Reset to Defaults" link at the bottom
  - "Save Settings" button
  - Confirmation dialog for resetting defaults

### 5.3 RAG Implementation

- **Transcript Processing:**
  - API call to YouTube Transcript Extraction Service
  - Caching of processed transcripts for faster subsequent queries
  - Error handling for failed transcript retrievals

- **Context Retrieval:**
  - Implementation of similarity search on processed transcripts
  - Retrieval of top N chunks based on user query
  - Adjustable retrieval parameters (e.g., chunk size, overlap)

- **LLM Integration:**
  - Support for multiple LLM providers (OpenAI, Anthropic, Ollama)
  - Dynamic prompt construction using retrieved context and user query
  - Streaming response support for real-time display

## 6. User Flow

1. **Initial Setup:**
   - User opens the application
   - Clicks hamburger menu to open configuration sidebar
   - Enters API keys and configures settings
   - Saves settings and closes sidebar

2. **Channel Processing:**
   - User enters YouTube channel URL in main container
   - Clicks "Process Channel" button
   - Views progress indicator during processing

3. **Querying:**
   - User types query in input field
   - Clicks "Send" or presses Enter
   - Views progress indicator during context retrieval and response generation

4. **Viewing Responses:**
   - User reads AI-generated response in chat display
   - Can scroll through conversation history
   - Optionally expands code blocks or copies text

5. **Adjusting Settings:**
   - User can open sidebar at any time to modify settings
   - Changes take effect after saving and may require reprocessing the channel

## 7. Error Handling and Edge Cases

- Invalid YouTube channel URL handling
- API key validation and error messages
- Graceful degradation when LLM service is unavailable
- Handling of rate limits and usage quotas
- Proper error messages for network issues or service disruptions

## 8. Performance Considerations

- Efficient caching of processed transcripts
- Optimized context retrieval for quick response times
- Lazy loading of chat history for improved performance with long conversations
- Consideration of web worker usage for computationally intensive tasks

## 9. Security Measures

- Secure storage of API keys (client-side encryption)
- Input sanitization to prevent XSS attacks
- Proper CORS configuration for API requests
- Rate limiting to prevent abuse

## 10. Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Sufficient color contrast for readability
- Responsive design for various screen sizes and devices

## 11. Future Enhancements

- Multi-channel support for querying across multiple YouTube channels
- Integration with additional LLM providers
- Advanced visualization of source transcripts
- User account system for saving preferences and conversation history
- Export functionality for chat logs and retrieved contexts

## 12. Development Phases

1. **Phase 1:** Basic UI implementation and YouTube Transcript Extraction Service integration
2. **Phase 2:** LLM integration and RAG implementation
3. **Phase 3:** Configuration sidebar and settings management
4. **Phase 4:** Error handling, performance optimization, and security measures
5. **Phase 5:** Testing, bug fixes, and final polish

## 13. Success Criteria

- Successful processing of YouTube channel transcripts
- Accurate and relevant responses to user queries
- Intuitive and responsive user interface
- Proper functionality of all configuration options
- Stable performance with various YouTube channels and query types

## 14. YouTube Extraction Service Notes:

### API Endpoints

- POST `/process_channel`: Submit a channel for processing
- GET `/job_status/{job_id}`: Check the status of a processing job
- GET `/relevant_chunks`: Retrieve relevant transcript chunks for a given query

### Frontend Integration

To integrate this YouTube Extraction Service into a frontend application, follow these steps:

1. Set up a React frontend project:
   ```bash
   npx create-react-app youtube-qa-frontend
   cd youtube-qa-frontend
   ```

2. Install necessary dependencies:
   ```bash
   npm install axios @material-ui/core @material-ui/icons
   ```

3. Create a new file `src/api.js` to handle API calls:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const processChannel = async (channelUrl) => {
  const response = await axios.post(`${API_BASE_URL}/process_channel`, { channel_url: channelUrl });
  return response.data;
};

export const getJobStatus = async (jobId) => {
  const response = await axios.get(`${API_BASE_URL}/job_status/${jobId}`);
  return response.data;
};

export const getRelevantChunks = async (query, channelId, chunkLimit = 5, contextWindow = 1) => {
  const response = await axios.get(`${API_BASE_URL}/relevant_chunks`, {
    params: { query, channel_id: channelId, chunk_limit: chunkLimit, context_window: contextWindow }
  });
  return response.data;
};
```

4. Create a new component `src/YouTubeQA.js`:

```jsx
import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Typography, Paper } from '@material-ui/core';
import { processChannel, getJobStatus, getRelevantChunks } from './api';

const YouTubeQA = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [query, setQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const [relevantChunks, setRelevantChunks] = useState([]);

  const handleProcessChannel = async () => {
    setProcessing(true);
    try {
      const { job_id } = await processChannel(channelUrl);
      await pollJobStatus(job_id);
    } catch (error) {
      console.error('Error processing channel:', error);
    }
    setProcessing(false);
  };

  const pollJobStatus = async (jobId) => {
    while (true) {
      const { status, progress, channel_id } = await getJobStatus(jobId);
      if (status === 'SUCCESS') {
        setChannelId(channel_id);
        break;
      } else if (status === 'FAILED') {
        console.error('Channel processing failed');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleQuery = async () => {
    if (!channelId) return;
    try {
      const { chunks } = await getRelevantChunks(query, channelId);
      setRelevantChunks(chunks);
    } catch (error) {
      console.error('Error retrieving relevant chunks:', error);
    }
  };

  return (
    <Paper style={{ padding: '20px', maxWidth: '600px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>YouTube QA System</Typography>
      <TextField
        fullWidth
        label="YouTube Channel URL"
        value={channelUrl}
        onChange={(e) => setChannelUrl(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcessChannel}
        disabled={processing || !channelUrl}
      >
        {processing ? <CircularProgress size={24} /> : 'Process Channel'}
      </Button>
      {channelId && (
        <>
          <TextField
            fullWidth
            label="Ask a question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleQuery}
            disabled={!query}
          >
            Ask
          </Button>
          {relevantChunks.map((chunk, index) => (
            <Paper key={index} style={{ padding: '10px', margin: '10px 0' }}>
              <Typography variant="body1">{chunk.main_chunk}</Typography>
              <Typography variant="caption">Score: {chunk.score}</Typography>
            </Paper>
          ))}
        </>
      )}
    </Paper>
  );
};

export default YouTubeQA;
```

5. Update `src/App.js` to use the new component:

```jsx
import React from 'react';
import YouTubeQA from './YouTubeQA';

function App() {
  return (
    <div className="App">
      <YouTubeQA />
    </div>
  );
}

export default App;
```

### Using with an LLM

To use the retrieved chunks with an LLM API (e.g., OpenAI's GPT), you can implement a function like this:

```javascript
import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = 'your_openai_api_key';

export const generateAnswer = async (question, relevantChunks) => {
  const context = relevantChunks.map(chunk => chunk.main_chunk).join('\n\n');
  const messages = [
    { role: 'system', content: 'You are a helpful assistant that answers questions based on the given context.' },
    { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
  ];

  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
};
```

You can then use this function in your React component to generate answers based on the retrieved chunks.


---

This scope document provides a comprehensive blueprint for developing the YouTube Channel RAG Chat Application. It covers all major aspects of the project, from high-level objectives to detailed component specifications and development phases.