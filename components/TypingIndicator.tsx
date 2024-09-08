// components/TypingIndicator.tsx
const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1 items-center p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
)

export default TypingIndicator