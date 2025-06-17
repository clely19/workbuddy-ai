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

  export const storeParsedCommandInFirebase = async (parsed) => {
    try {
      await addDoc(collection(db, "parsed_commands"), {
        ...parsed,
        createdAt: serverTimestamp()
      });
      console.log("Parsed command saved.");
    } catch (error) {
      console.error("Error saving parsed command:", error);
    }
  };