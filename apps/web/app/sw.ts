/// <reference lib="webworker" />
import { NetworkOnly, Serwist } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Record<string, string> | undefined
}

const precacheManifest = self.__SW_MANIFEST

const serwist = new Serwist({
  precacheEntries: [
    ...(precacheManifest ? Object.values(precacheManifest) : []),
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        request.mode === 'navigate' && url.origin === self.location.origin,
      method: 'GET',
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.mode === 'navigate',
      },
    ],
  },
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([caches.delete('paginas'), caches.delete('supabase-rest')]),
  )
})

serwist.addEventListeners()
