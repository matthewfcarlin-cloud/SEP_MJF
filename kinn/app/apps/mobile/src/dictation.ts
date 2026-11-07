/**
 * Speech to text that runs on the phone only. If this device cannot recognise speech offline,
 * voice is reported as unavailable rather than falling back to Apple's servers, because the
 * consent screen and the privacy policy say nothing leaves the phone.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition'
import { useState } from 'react'

export type DictationProblem = 'refused' | 'unavailable' | undefined

export interface Dictation {
  readonly listening: boolean
  readonly partial: string
  readonly problem: DictationProblem
  readonly toggle: () => void
}

export function useDictation(onFinal: (text: string) => void): Dictation {
  const [listening, setListening] = useState(false)
  const [partial, setPartial] = useState('')
  const [problem, setProblem] = useState<DictationProblem>(undefined)

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? ''
    if (e.isFinal) {
      onFinal(text)
      setPartial('')
    } else {
      setPartial(text)
    }
  })
  useSpeechRecognitionEvent('end', () => setListening(false))
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false)
    // Stopping before any word was heard is not a problem worth showing.
    if (e.error === 'no-speech' || e.error === 'aborted') return
    console.warn('RECO: speech recognition stopped.', e.error, e.message)
    setProblem(e.error === 'not-allowed' ? 'refused' : 'unavailable')
  })

  const start = async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      if (!permission.granted) {
        setProblem('refused')
        return
      }
      if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
        setProblem('unavailable')
        return
      }
      setProblem(undefined)
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: true })
      setListening(true)
    } catch (error) {
      console.warn('RECO: could not start speech recognition.', error)
      setProblem('unavailable')
    }
  }

  const toggle = () => {
    if (listening) ExpoSpeechRecognitionModule.stop()
    else void start()
  }

  return { listening, partial, problem, toggle }
}
