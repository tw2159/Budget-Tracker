let db;

// establish a connection to the 'budget_tracker' IndexedDB database and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event is triggered when a database of a bigger version number than the existing stored database is loaded
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

// this event is fired when the result of a request is successfully returned
request.onsuccess = function(event) {
  db = event.target.result;

  // if the app is online, then execute the uploadTransaction() function to send all local db data to the api
  if (navigator.onLine) {
    uploadTransaction();
  }
};

// this event is fired when a request returns an error
request.onerror = function(event) {
  // log error
  console.log(event.target.errorCode);
};

// save the record when there's no internet connection
function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_transaction');
  budgetObjectStore.add(record);
}

// upload the local records when there's an internet connection
function uploadTransaction() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_transaction');

  // get all of the records in the indexedDb
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    // if there was data in indexedDB's store, send it to the api server
    if(getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if(serverResponse.message) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_transaction'], 'readwrite');
        const budgetObjectStore = transaction.objectStore('new_transaction');
        budgetObjectStore.clear();

        alert('All saved transactions has been submitted!');
      })
      .catch(err => {
        console.log(err);
      });
    }
  }
}

// execute the uploadTransaction() function once the app is back online
window.addEventListener('online', uploadTransaction);
