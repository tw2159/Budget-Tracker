let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_transaction');
  budgetObjectStore.add(record);
}

function uploadBudget() {
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
      })
      .catch(err => {
        console.log(err);
      });
    }
  }
}

window.addEventListener('online', uploadTransaction);