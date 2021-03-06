'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/android.png": "4a1d31521dfd9c051fc85b562abf0c08",
"assets/apple.png": "2f2c166780f6979cfe49045ad2fc30b8",
"assets/AssetManifest.json": "bec26380793b61c4e87e6366710a0090",
"assets/assets/android.png": "4a1d31521dfd9c051fc85b562abf0c08",
"assets/assets/apple.png": "2f2c166780f6979cfe49045ad2fc30b8",
"assets/assets/background.png": "bd6001ab13133a5fc0893ba65acda503",
"assets/assets/fav.png": "d9304ba0adef6b9403209c1dea64f381",
"assets/assets/favcircle.png": "7312f12cac187a335e12742b180b301a",
"assets/assets/favicon.ico": "f4ebcbd978a981d3c92ba8123dd4b916",
"assets/assets/favTransparentCenter.png": "4c5debfbdf4ffba54bb1a6cbd34e4039",
"assets/assets/google.png": "b109199b1573cbd3c6a3e572985d5f76",
"assets/assets/iphone.png": "adc8ef567b4d50f0945da3337478511d",
"assets/assets/moontree_eclipse_dark_transparent.png": "2852eaacb74824e5cf5f07f95670dc21",
"assets/assets/moontree_logo.png": "1ecd88fc7c03d219177113fb0ed65606",
"assets/assets/phones.png": "17322c5f932a38b9eb9ca980f2f613b3",
"assets/background.png": "bd6001ab13133a5fc0893ba65acda503",
"assets/fav.png": "d9304ba0adef6b9403209c1dea64f381",
"assets/favcircle.png": "7312f12cac187a335e12742b180b301a",
"assets/favTransparentCenter.png": "4c5debfbdf4ffba54bb1a6cbd34e4039",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/google.png": "b109199b1573cbd3c6a3e572985d5f76",
"assets/iphone.png": "adc8ef567b4d50f0945da3337478511d",
"assets/moontree_eclipse_dark_transparent.png": "2852eaacb74824e5cf5f07f95670dc21",
"assets/moontree_logo.png": "1ecd88fc7c03d219177113fb0ed65606",
"assets/NOTICES": "1f01d13b32a3c38b25748d16c3436183",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/phones.png": "17322c5f932a38b9eb9ca980f2f613b3",
"assets/png-transparent-google-play-app-store-mobile-phones-google-ink-text-rectangle.png": "54b6bc4935fc27c95635b9cfcf1600f9",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "11895a76c227bef250dba5585ecbaf46",
"/": "11895a76c227bef250dba5585ecbaf46",
"main.dart.js": "b6ba5db32e3b20e0ef307758e86678ce",
"manifest.json": "1066e4d9e100d9ab59462e0fca03f47e",
"version.json": "65785171f740470ba8cd16ae8a77bf62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
