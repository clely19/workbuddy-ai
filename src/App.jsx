import { useEffect, useState } from 'react'
import './App.css'
import { fetchParsedCommandInFirebase, storeCommandInFirebase, storeParsedCommandInFirebase } from './agents/firebaseAgent';
import { parseCommandWithGemini } from './agents/commandAgent';
import { Disclosure } from '@headlessui/react'

function App() {
  const [command, setCommand] = useState('')
  const [parsedTasks, setParsedTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

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

  useEffect(() => {
    const unsubscribe = fetchParsedCommandInFirebase(setParsedTasks);
    return () => unsubscribe();
  }, []);




  useEffect(() => {
    if (darkMode) {
      
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    
    <div className=' min-h-screen w-full p-0 m-0 flex flex-col flex-grow transition-colors duration-300 bg-gray-100 dark:bg-gray-900 text-black dark:text-white'>
      
      {/* navbar */}
      <Disclosure as="nav" className="bg-gray-100 text-black dark:bg-gray-800 dark:text-white flex justify-between items-center">

        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </label>

      </Disclosure>

        {/* entire dashboard */}
      <div className='flex flex-col justify-between max-w-7xl mx-auto w-full'>
        {/* top columns */}
        <div className='flex pt-6 gap-x-6 '>
          {/* left column */}
          <div className="w-1/2 p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <h1 className="text-2xl font-bold">Task Dashboard</h1>

            {parsedTasks.length === 0 && <p>No tasks yet.</p>}

            {parsedTasks.map(task => {
              console.log("task.datetime:", task.datetime);
              return (
                <div key={task.id} className="border p-4 rounded bg-white dark:bg-gray-800 shadow">
                  <p><strong>Task:</strong> {task.task}</p>
                  <p><strong>When:</strong> {new Date(task.datetime).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          {/* right column */}
          <div className="w-1/2 border-l border-gray-300 dark:border-gray-700 pl-6">
            <h1 className="text-2xl font-bold">Summary (Coming Soon)</h1>
          </div>
        </div>

      </div>
      
        {/* bottom input area */}
        <div className='sticky bottom-0 px-6 pt-8 pb-6 bg-gray-100 dark:bg-gray-900 z-10 shadow-inner'>
          <h1 className="text-3xl font-bold text-center">WorkBuddy AI</h1>
          <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-2'>
            <textarea className='w-full p-2 border rounded' rows="2"
              placeholder="Type a command: e.g. 'Remind me to email Clely tomorrow at 9am.'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />

            <button

              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 text-white rounded transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
  )
}

export default App
