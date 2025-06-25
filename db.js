
// db.js - IndexedDB Utility Functions
const DB_NAME = 'quizzyDB';
const DB_VERSION = 1;
const STORE_QUIZZES = 'quizzes';
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Database error: ' + event.target.error.message);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database initialised successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_QUIZZES)) {
        // keyPath is 'id'. If 'id' is not on object for add(), it's auto-generated.
        const store = tempDb.createObjectStore(STORE_QUIZZES, { keyPath: 'id', autoIncrement: true });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      console.log('Database upgrade complete or already up-to-date');
    };
  });
}

function addQuiz(quizData) {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB(); // Ensure db is initialized
    
    const transaction = db.transaction([STORE_QUIZZES], 'readwrite');
    const store = transaction.objectStore(STORE_QUIZZES);
    
    // Ensure essential fields are present
    const quizToAdd = { 
      questions: [], // Default to empty array
      createdAt: new Date().toISOString(),
      ...quizData, // Spread quizData, allowing it to overwrite defaults if provided
    };
    // Remove id property if it exists to ensure auto-increment works reliably for 'add'
    // if quizData comes with an id, it might conflict with autoIncrement strategy.
    delete quizToAdd.id; 

    const request = store.add(quizToAdd);

    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the key of the added record (the auto-generated ID)
    };

    request.onerror = (event) => {
      console.error('Error adding quiz:', event.target.error);
      reject('Error adding quiz: ' + event.target.error.message);
    };
  });
}

function getAllQuizzes() {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_QUIZZES], 'readonly');
    const store = transaction.objectStore(STORE_QUIZZES);
    const request = store.getAll(); // Gets all records

    request.onsuccess = () => {
      resolve(request.result || []); // Return empty array if no results
    };

    request.onerror = (event) => {
      console.error('Error getting all quizzes:', event.target.error);
      reject('Error getting all quizzes: ' + event.target.error.message);
    };
  });
}

function getQuiz(id) {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_QUIZZES], 'readonly');
    const store = transaction.objectStore(STORE_QUIZZES);
    // Ensure ID is of the correct type (number for autoIncremented keys)
    const numericId = Number(id);
    if (isNaN(numericId)) {
        return reject('Invalid ID format for getQuiz.');
    }
    const request = store.get(numericId);

    request.onsuccess = () => {
      resolve(request.result); // Returns the quiz object or undefined if not found
    };

    request.onerror = (event) => {
      console.error('Error getting quiz by ID:', event.target.error);
      reject('Error getting quiz by ID: ' + event.target.error.message);
    };
  });
}

function updateQuiz(quiz) {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    if (!quiz.id) {
      return reject('Quiz ID is required for update.');
    }
    const transaction = db.transaction([STORE_QUIZZES], 'readwrite');
    const store = transaction.objectStore(STORE_QUIZZES);
    
    // Ensure quiz.id is a number if it was auto-generated
    const quizToUpdate = { ...quiz, id: Number(quiz.id) };

    const request = store.put(quizToUpdate); // `put` updates if key exists, or adds if not.

    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the key of the updated/added record
    };

    request.onerror = (event) => {
      console.error('Error updating quiz:', event.target.error);
      reject('Error updating quiz: ' + event.target.error.message);
    };
  });
}

function deleteQuizDB(id) {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_QUIZZES], 'readwrite');
    const store = transaction.objectStore(STORE_QUIZZES);
    // Ensure ID is of the correct type
    const numericId = Number(id);
    if (isNaN(numericId)) {
        return reject('Invalid ID format for deleteQuizDB.');
    }
    const request = store.delete(numericId);

    request.onsuccess = () => {
      resolve(); // No specific result, just success
    };

    request.onerror = (event) => {
      console.error('Error deleting quiz:', event.target.error);
      reject('Error deleting quiz: ' + event.target.error.message);
    };
  });
}