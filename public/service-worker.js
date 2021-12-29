const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'v_1';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/index.js',
  './js/idb.js',
  './icons/icon-512x512.png',
  './icons/icon-384x384.png',
  './icons/icon-192x192.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',
  './icons/icon-72x72.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  )
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if(cacheKeeplist.indexOf(key) === -1) {
          // delete cache
          return caches.delete(keyList[i]);
        }
      }));
    })
  )
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(request) {
      // if cache is available, return cache
      if(request) {
        return request;
      }
      // else, try fetching request
      else {
        return fetch(e.request)
      }
    })
  )
});