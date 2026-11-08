'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface InstallPromptEvent extends Event {
  prompt(): Promise<unknown>
}

export function RegisterSw() {
  const pathname = usePathname()
  const prompt = useRef<InstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showAppleInstructions, setShowAppleInstructions] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (window.location.hostname !== 'shapeos-fichafacil.vercel.app') return

    const displayMode = window.matchMedia('(display-mode: standalone)')
    const appleNavigator = navigator as Navigator & { standalone?: boolean }
    const isStandalone = () => displayMode.matches || appleNavigator.standalone === true
    const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent)

    function clearOffer() {
      prompt.current = null
      setShowInstall(false)
      setShowAppleInstructions(false)
    }

    function handleDisplayMode() {
      if (isStandalone()) {
        clearOffer()
      } else {
        setShowAppleInstructions(isAppleMobile && isSafari)
      }
    }

    function handleInstallPrompt(event: Event) {
      if (isStandalone()) return
      event.preventDefault()
      prompt.current = event as InstallPromptEvent
      setShowInstall(true)
    }

    handleDisplayMode()
    displayMode.addEventListener('change', handleDisplayMode)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', clearOffer)

    return () => {
      displayMode.removeEventListener('change', handleDisplayMode)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', clearOffer)
    }
  }, [])

  if (pathname !== '/login') return null

  async function install() {
    const installPrompt = prompt.current
    if (!installPrompt) return

    prompt.current = null
    setShowInstall(false)
    try {
      await installPrompt.prompt()
    } catch (error) {
      console.warn('Não foi possível abrir o diálogo de instalação do ShapeOS.', error)
    }
  }

  if (showInstall) {
    return (
      <button
        type="button"
        onClick={install}
        className="fixed bottom-4 left-4 z-40 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        Instalar ShapeOS
      </button>
    )
  }

  if (showAppleInstructions) {
    return (
      <details className="fixed bottom-4 left-4 z-40 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
        <summary className="cursor-pointer font-semibold">Como instalar o ShapeOS</summary>
        <p className="mt-2">No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p>
      </details>
    )
  }

  return null
}
