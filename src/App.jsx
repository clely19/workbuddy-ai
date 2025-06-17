import { useState } from 'react'
import './App.css'
import { storeCommandInFirebase, storeParsedCommandInFirebase } from './agents/firebaseAgent';
import { parseCommandWithGemini } from './agents/commandAgent';

function App() {
  const [command, setCommand] = useState('')

  const handleSubmit = async () => {
    console.log('User Command:', command);
    //storing command in firebase
   await storeCommandInFirebase(command);
    // Call agent here later
    const parsed = await parseCommandWithGemini(command);
    if (parsed) {
      await storeParsedCommandInFirebase(parsed);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-6 flex flex-col min-h-screen justify-center items-center'>
      <h1 className="text-4xl font-bold mb-4">WorkBuddy AI</h1>
      <textarea className='w-full p-2 border rounded' rows="3"
        placeholder="Type a command: e.g. 'Remind me to email Raj tomorrow at 9am.'"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />

      <button
      
        onClick={handleSubmit}
        className ="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
        >
        Submit
      </button>
    </div>
  )
}

export default App
