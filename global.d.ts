import * as faceapi from '@vladmandic/face-api'

declare global {
  interface Window {
    faceapi: typeof faceapi
    inspectData: () => void
  }
}
