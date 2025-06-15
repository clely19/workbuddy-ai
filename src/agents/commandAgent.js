//Extract structured data from this command:
// Input: "Remind me to finish my AI homework on Monday at 6 PM."
// Output:
// {
//   "action": "create_reminder",
//   "task": "finish my AI homework",
//   "datetime": "Monday 6 PM"
// }

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const storeCommandInFirebase = async (commandText) => {
  console.log("Entered storeCommandInFirebase");
  try {
    const docRef = await addDoc(collection(db, "commands"), {
      command: commandText,
      createdAt: serverTimestamp()
    });
    console.log("Command saved with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding command:", error);
  }
};
