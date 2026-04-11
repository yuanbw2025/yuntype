// 云中书 YunType — Service Worker (缓存优先策略)

const CACHE_NAME = 'yuntype-v1'
const STATIC_ASSETS = [
  '/yuntype/',
  '/yuntype/index.html',
]

// 安装：缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截：网络优先，失败回退缓存
self.addEventListener('fetch', (event) => {
  // 只处理同源 GET 请求
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功获取网络响应，更新缓存
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // 网络失败，从缓存读取
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 })
        })
      })
  )
})
