# Channel Chat

Channel Chat is an interactive web application that allows users to ask questions about YouTube channels and receive AI-generated answers based on the channel's content. This project leverages the power of large language models to provide insightful responses to user queries.

Demo: https://channel-chat-pi.vercel.app/

![Screenshot](https://github.com/user-attachments/assets/1644249d-56d2-4bfc-ac95-d88ba6abf504)

## Features

- Process YouTube channels to extract and analyze their content
- Ask questions about specific YouTube channels
- Receive AI-generated answers based on channel transcripts
- Configurable settings for API keys, model selection, and processing parameters
- Support for both OpenAI and Ollama models
- Real-time job status updates
- Responsive design for various screen sizes

## Technologies Used

- React
- Material-UI
- Axios for API requests
- OpenAI API
- Ollama (for local model support)
- Redis (for backend caching, not directly used in frontend)
- Celery (for backend task processing, not directly used in frontend)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- A backend server running the YouTube Extraction Service (separate repository)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/channel-chat.git
   cd channel-chat
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000
   REACT_APP_OLLAMA_API_URL=http://localhost:11434
   ```
   Replace the URLs with your actual backend and Ollama server addresses.

4. Start the development server:
   ```
   npm start
   ```

The application should now be running on `http://localhost:3000`.

## Usage

1. Open the application in your web browser.
2. Enter a YouTube channel URL in the input field and click "Process Channel".
3. Once the channel is processed, you can start asking questions about the channel's content.
4. Type your question in the input field and click "Send" to receive an AI-generated answer.

## Configuration

Click the menu icon in the top-left corner to open the configuration sidebar. Here you can set:

- OpenAI API Key
- Ollama Endpoint (for local model support)
- Active AI Model
- Transcript Limit
- Chunk Limit
- Token Limit

These settings are persisted in your browser's local storage.

## API Integration

The frontend integrates with a separate backend service for processing YouTube channels and retrieving relevant transcript chunks. Ensure that the backend service is running and properly configured.

Key API endpoints:

- `/process_channel`: Start processing a YouTube channel
- `/job_status/{job_id}`: Check the status of a processing job
- `/relevant_chunks`: Retrieve relevant transcript chunks for a given query

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Material-UI](https://material-ui.com/)
- [OpenAI](https://openai.com/)
- [Ollama](https://ollama.ai/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
