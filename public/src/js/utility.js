var OBJECT_STORE_NAME = 'posts'
var dbPromise = idb.open('posts-store', 1, function (db){
  if(!db.objectStoreNames.contains(OBJECT_STORE_NAME)){
    db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  }
});


function writeData(store_name, data){
  return dbPromise.then(function(db){
    var tx = db.transaction(store_name, 'readwrite');
    var store = tx.objectStore(store_name);
    // Put overwrites the value which is present already
    // But if we remove some entry then that wont be reflected immediately unless you clear it before put immediately
    store.put(data);
    return tx.complete;
  });
}

function readAllData(store_name){
  return dbPromise.then(function (db){
    var tx = db.transaction(store_name, 'readonly');
    var store = tx.objectStore(store_name);
    return store.getAll();
  })
}

function clearAllData(store_name){
  return dbPromise.then(function (db){
    var tx = db.transaction(store_name, 'readwrite');
    var store = tx.objectStore(store_name);
    store.clear();
    return tx.complete;
  })
}

function deleteItemFromData(store_name, id){
  return dbPromise.then(function (db){
    var tx = db.transaction(store_name, "readwrite");
    var store = tx.objectStore(store_name);
    store.delete(id)
    return tx.complete;
  })
}
