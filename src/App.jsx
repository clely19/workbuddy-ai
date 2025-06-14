import { useState } from 'react'
import './App.css'

function App() {
  const [command, setCommand] = useState('')
  
  const handleSubmit = () => {
    console.log('User Command:', command);
    // Call agent here later
  };

  return (
      <div>
        <h1>WorkBuddy AI</h1>
      <textarea
        placeholder="Type a command: e.g. 'Remind me to email Raj tomorrow at 9am.'"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <button
        onClick={handleSubmit}>
        Submit
      </button>
    </div>
  )
}

export default App
