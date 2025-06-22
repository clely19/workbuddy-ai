import { useEffect, useState } from 'react'
import './App.css'
import { subscribeParsedCommandInFirebase, storeCommandInFirebase, storeParsedCommandInFirebase, toggleTaskCompletion, deleteTask } from './agents/firebaseAgent';
import { parseCommandWithGemini, summarizeTasks, classifyIntent, answerUserQuestion } from './agents/commandAgent';
import { Disclosure } from '@headlessui/react'
import UsageChart from './components/usageChart';
import { prepareUsageData } from './utils/usageUtils';

function App() {
  const [command, setCommand] = useState('')
  const [parsedTasks, setParsedTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [summary, setSummary] = useState('');
  const [answer, setAnswerResult] = useState("");
  const usageData = prepareUsageData(parsedTasks);



  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      console.log("🎙️ Recognized Speech:", spokenText);
      setCommand(spokenText); // Autofill the textarea
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
    };

    recognition.start();
  };


  const handleSubmit = async () => {
    console.log('User Command:', command);

    const intent = await classifyIntent(command);
    console.log("Detected intent:", intent);

    if (intent === "new_task") {
      //storing command in firebase
      await storeCommandInFirebase(command);
      const parsed = await parseCommandWithGemini(command);
      if (parsed) {
        await storeParsedCommandInFirebase(parsed);
      }
    } else if (intent === "question") {
      const answer = await answerUserQuestion(command, parsedTasks);
      setAnswerResult(answer);
    } else if (intent === "summarize") {
      const summary = await summarizeTasks(parsedTasks);
      setSummary(summary);
    } else {
      console.warn("Unknown intent");
    }

    setCommand(""); // clear input
  };

  // const handleSummarize = async () => {
  //   const result = await summarizeTasks(parsedTasks);
  //   setSummary(result || "No summary available.");
  // };


  useEffect(() => {
    const unsubscribe = subscribeParsedCommandInFirebase(setParsedTasks);
    return () => unsubscribe();
  }, []);




  useEffect(() => {
    if (darkMode) {

      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const isToday = (dateStr) => {
    const taskDate = new Date(dateStr);
    const now = new Date();
    return (
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth() === now.getMonth() &&
      taskDate.getDate() === now.getDate()
    );
  };
  const isTomorrow = (dateStr) => {
    const taskDate = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return (
      taskDate.getFullYear() === tomorrow.getFullYear() &&
      taskDate.getMonth() === tomorrow.getMonth() &&
      taskDate.getDate() === tomorrow.getDate()
    );
  };

  const todayTasks = parsedTasks.filter(task => isToday(task.datetime));
  const tomorrowTasks = parsedTasks.filter(task => isTomorrow(task.datetime));

  const completedCount = parsedTasks.filter(task => task.isCompleted).length;
  const totalCount = parsedTasks.length;


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

            {/* Today */}
            <h2 className="text-xl font-semibold mt-2 mb-6 space-y-4">Today</h2>
            {todayTasks.length === 0 ? (
              <p>No tasks today.</p>
            ) : (
              todayTasks.map(task => {
                return (
                  <div key={task.id} className={"border p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 ${task.isCompleted ? 'opacity-50' : ''}`"}>
                    <div className='flex justify-between items-center'>
                    <div>
                    <p className='font-medium text-lg'> {task.task}</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{new Date(task.datetime).toLocaleString()}</p>
                    </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
                        className={`px-2 py-1 rounded text-sm ${task.isCompleted ? 'bg-yellow-500' : 'bg-green-500'} text-white `}
                      >
                        {task.isCompleted ? <span className='inline-flex items-center'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
                        </svg>

                          Undo</span> : <span className='inline-flex items-center'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Complete</span>}
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-2 py-1 rounded bg-red-500 text-white text-sm inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Tomorrow */}
            <h2 className="text-xl font-semibold mt-2 mb-6 space-y-4">Tomorrow</h2>
            {tomorrowTasks.length === 0 ? (
              <p>No tasks tomorrow.</p>
            ) : (
              tomorrowTasks.map(task => {
                return (
                  <div key={task.id} className={"border p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 ${task.isCompleted ? 'opacity-50' : ''}`"}>
                    <div className='flex justify-between items-center'>
                    <div>
                    <p className='font-medium text-lg'>{task.task}</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{new Date(task.datetime).toLocaleString()}</p>
                    </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
                        className={`px-2 py-1 rounded text-sm ${task.isCompleted ? 'bg-yellow-500' : 'bg-green-500'} text-white`}
                      >

                        {task.isCompleted ? <span className='inline-flex items-center'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
                        </svg>

                          Undo</span> : <span className='inline-flex items-center'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Complete</span>}
                      </button>


                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-2 py-1 rounded bg-red-500 text-white text-sm inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}

          </div>
          {/* right column */}
          <div className="w-1/2 border-l border-gray-300 dark:border-gray-700 pl-6 overflow-y-auto max-h-[60vh]">
            <h1 className="text-2xl font-bold">Summary</h1>
            <div className='bg-white dark:bg-gray-800 p-4 rounded shadow space-y-2 mt-4'>
            <p className='text-sm'><strong>{completedCount}</strong> of <strong>{totalCount}</strong> tasks completed</p>
            <p className='text-sm'><strong>{todayTasks.length}</strong> due today</p>
            <p className='text-sm'><strong>{tomorrowTasks.length}</strong> due tomorrow</p>
            </div>

            
    
            <h2 className="text-xl font-bold mt-6 mb-2">Usage Insights</h2>
            <UsageChart data={usageData} />

            {answer && (
              <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded shadow">
                <h2 className="font-semibold text-lg mb-1">Prority</h2>
                <p>{answer}</p>
              </div>
            )}
            {summary && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded shadow">
                <h2 className="font-semibold text-lg mb-1">Task Summary</h2>
                <p>{summary}</p>
              </div>
            )}

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

          <div className='flex gap-2'>
            <button
              onClick={startListening}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Speak
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 text-white rounded transition">
              Submit
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
