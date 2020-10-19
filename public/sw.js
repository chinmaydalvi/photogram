var CACHE_STATIC_NAME = 'static-v9';
var CACHE_DYNAMIC_NAME = 'dynamic-v4';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]
// You can call this function on any event in SW depending on use case
function trimCache(cacheNames, maxItem){
  console.log('Deleting...')
  caches.open(cacheNames)
      .then((cache)=>{
        return cache.keys()
            .then((keys)=>{
                if(keys.length > maxItem){
                  console.log("Deleted", keys[0])
                  cache.delete(keys[0])
                      .then(trimCache(cacheNames, maxItem))
                }
            })
      })
}

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
          .then(function(cache) {
            console.log('[Service Worker] Precaching App Shell');
            cache.addAll(STATIC_FILES);
          })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
      caches.keys().then((keyList)=>{
        const keys = keyList.map((key)=>{
          if(key !== CACHE_DYNAMIC_NAME && key !== CACHE_STATIC_NAME){
            console.log('[Service Worker] removing old cache', key)
            return caches.delete(key);
          }
        })
        return Promise.all(keys)
      })
  )
  return self.clients.claim();
});

// Cache then n/w  policy
// self.addEventListener('fetch', function(event) {
//   if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
//
//   event.respondWith(
//       caches.match(event.request)
//           .then(function(response) {
//             if (response) {
//               return response;
//             } else {
//               return fetch(event.request).then((response)=>{
//                 return caches.open('dynamic').then((cache)=>{
//                   cache.put(event.request.url, response.clone());
//                   return response;
//                 });
//               }).catch((e) =>{
//                 return caches.open(CACHE_STATIC_NAME).then((cache)=>{
//                   return cache.match('/offline.html');
//                 })
//               })
//             }
//           })
//   );
// });

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

self.addEventListener('fetch', function(event) {
  if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
  var url = 'https://photogram-c5234.firebaseio.com/posts.json';
  if(event.request.url.indexOf(url) > -1){
    event.respondWith(
        caches.open(CACHE_DYNAMIC_NAME)
            .then((cache)=>{
              return fetch(event.request)
                  .then((response)=>{
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request, response.clone())
                    return response;
                  })
            }).catch((err)=>{
              console.log("Failed=", err);
            })
    );
  }
  // else if(isInArray(event.request.url ,STATIC_FILES)) {
  //     event.respondWith(
  //       caches.match(event.request)
  //     );
  // }
  else{
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
              if (response) {
                return response;
              } else {
                return fetch(event.request).then((response)=>{
                  return caches.open(CACHE_DYNAMIC_NAME)
                      .then((cache)=>{
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, response.clone());
                    return response;
                  });
                }).catch((e) =>{
                  return caches.open(CACHE_STATIC_NAME).then((cache)=>{
                    // if(event.request.url.indexOf('/help')){
                    //   return cache.match('/offline.html');
                    // }
                    // BETTER WAY
                    // To Redirect to offline.html when any HTML page failed to load
                    if(event.request.headers.get('accept').includes('text/html')){
                      return cache.match('/offline.html')
                    }
                  })
                })
              }
            })
    );
  }
});


// Cache only policy
// self.addEventListener('fetch', function(event) {
//   if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
//   event.respondWith(
//       caches.match(event.request)
//   );
// });

// Network only policy
// self.addEventListener('fetch', function(event) {
//   if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
//   event.respondWith(
//       fetch(event.request)
//   );
// });

// network with cache fallback
// self.addEventListener('fetch', function(event) {
//   if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol
//   event.respondWith(
//       fetch(event.request)
//       .catch(()=>{
//             caches.match(event.request)
//       })
//   );
// });

