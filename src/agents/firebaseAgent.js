import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';


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

  export const fetchParsedCommandInFirebase = (onUpdate) => {
    const q = query(collection(db,"parsed_commands"), orderBy("datetime", "desc"));
    return onSnapshot(q, (snapshot)=>{
        const tasks = snapshot.docs.map(doc => ({
            id:doc.id,
            ...doc.data()
        }));
        onUpdate(tasks);
    }
);
  }