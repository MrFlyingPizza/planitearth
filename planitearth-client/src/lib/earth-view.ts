import Phaser from 'phaser'
// Vite's percent-encoded inline SVGs are incompatible with Phaser's data-URL loader.
import planetUrl from '../assets/earth/planet.svg?url&no-inline'
import hazeUrl from '../assets/earth/haze.svg?url&no-inline'
import farmlandUrl from '../assets/earth/farmland.svg?url&no-inline'
import habitatUrl from '../assets/earth/habitat.svg?url&no-inline'
import waterUrl from '../assets/earth/water.svg?url&no-inline'
import wasteUrl from '../assets/earth/waste.svg?url&no-inline'
import sunUrl from '../assets/earth/sun.svg?url&no-inline'
import windUrl from '../assets/earth/wind.svg?url&no-inline'
import factoryUrl from '../assets/earth/factory.svg?url&no-inline'
import flowerUrl from '../assets/earth/flower.svg?url&no-inline'
import carUrl from '../assets/earth/car.svg?url&no-inline'
import { baseline, type AnswerScene, type CameraTarget, type EarthState, type ObjectAnimation } from './survey'

export interface EarthView {
  returnToSurvey(): Promise<void>
  showStep(state: EarthState, scene: AnswerScene): Promise<void>
  resetToBaseline(): Promise<void>
  pause(duration: number): Promise<void>
  destroy(): void
}

export function createEarthView(
  parent: HTMLElement,
  signal: AbortSignal,
): Promise<EarthView> {
  return new Promise((resolve, reject) => {
    let game: Phaser.Game | undefined
    let ready = false
    let destroyed = false
    const pending = new Set<(error: Error) => void>()
    const cancelled = () => new DOMException('Earth animation cancelled.', 'AbortError')
    const cancelPending = () => {
      for (const cancel of pending) cancel(cancelled())
      pending.clear()
    }
    const destroy = () => {
      if (destroyed) return
      destroyed = true
      clearTimeout(startupTimeout)
      signal.removeEventListener('abort', destroy)
      cancelPending()
      if (!ready) reject(cancelled())
      game?.destroy(true)
    }
    const startupTimeout = setTimeout(() => {
      reject(new Error('The planet could not start within 15 seconds. Please retry or try a browser with graphics support.'))
      destroy()
    }, 15000)
    if (signal.aborted) {
      destroy()
      return
    }
    signal.addEventListener('abort', destroy, { once: true })

    class EarthScene extends Phaser.Scene {
      private state: EarthState = { ...baseline }
      private focused = false
      private focus: CameraTarget | null = null
      private readonly objects = new Map<string, Phaser.GameObjects.Image>()
      private readonly objectHomes = new Map<string, {
        x: number; y: number; alpha: number; scaleX: number; scaleY: number; angle: number
      }>()
      private haze!: Phaser.GameObjects.Image
      private farmland!: Phaser.GameObjects.Image
      private habitat!: Phaser.GameObjects.Image
      private water!: Phaser.GameObjects.Image
      private sun!: Phaser.GameObjects.Image
      private wind!: Phaser.GameObjects.Image
      private factory!: Phaser.GameObjects.Image
      private waste: Phaser.GameObjects.Image[] = []
      private flowers: Phaser.GameObjects.Image[] = []

      preload() {
        const assets = { planet: planetUrl, haze: hazeUrl, farmland: farmlandUrl, habitat: habitatUrl,
          water: waterUrl, waste: wasteUrl, sun: sunUrl, wind: windUrl, factory: factoryUrl, flower: flowerUrl, car: carUrl }
        this.load.on('loaderror', (file: Phaser.Loader.File) => {
          reject(new Error(`Could not load planet artwork: ${file.key}. Please retry.`))
          destroy()
        })
        for (const [key, url] of Object.entries(assets)) {
          const size = key === 'planet' || key === 'haze' ? 1200 : 384
          this.load.svg(key, url, { width: size, height: size })
        }
      }

      create() {
        if (signal.aborted) return
        const sky = this.add.graphics()
        for (let i = 0; i < 75; i++) {
          sky.fillStyle(0xb4d7c7, 0.12 + (i % 4) * 0.06)
          sky.fillCircle((i * 173) % 2200, (i * 317) % 1500, i % 3 === 0 ? 2 : 1)
        }
        const earth = this.add.container(1000, 700)
        const image = (key: string, x: number, y: number, size: number) => {
          const item = this.add.image(x, y, key).setDisplaySize(size, size)
          earth.add(item)
          return item
        }
        const object = (id: string, key: string, x: number, y: number, size: number, alpha = 1) => {
          const item = image(key, x, y, size).setAlpha(alpha)
          this.objects.set(id, item)
          this.objectHomes.set(id, {
            x: item.x, y: item.y, alpha: item.alpha, scaleX: item.scaleX,
            scaleY: item.scaleY, angle: item.angle,
          })
          return item
        }
        object('planet', 'planet', 0, 0, 400)
        this.farmland = object('farmland', 'farmland', -63, -72, 105)
        this.habitat = object('habitat', 'habitat', 61, 24, 105)
        this.water = object('water', 'water', -49, 83, 64)
        this.haze = object('haze', 'haze', 0, 0, 421)
        this.sun = object('sun', 'sun', 208, -78, 64)
        this.wind = object('wind', 'wind', 197, 37, 65)
        this.factory = object('factory', 'factory', -201, -49, 63)
        object('car', 'car', -180, 75, 55, 0)
        for (let i = 0; i < 4; i++) this.waste.push(object(`waste-${i}`, 'waste', -162 + i * 24, 142 + (i % 2) * 10, 35))
        for (let i = 0; i < 3; i++) this.flowers.push(object(`flower-${i}`, 'flower', 38 + i * 29, 28 + (i % 2) * 25, 35))
        this.add.text(1000, 940, 'OUR SHARED HOME', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          color: '#d4e6a4',
          letterSpacing: 2,
        }).setOrigin(0.5)
        this.add.text(1000, 966, 'An illustrative planet, shaped by everyday choices.', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#a3b9ad',
        }).setOrigin(0.5)
        this.drawState()
        this.layout()
        this.scale.on('resize', this.layout, this)
        this.events.once('shutdown', cancelPending)
        ready = true
        clearTimeout(startupTimeout)
        resolve({
          returnToSurvey: () => this.moveCamera(false),
          showStep: (state, scene) => this.showStep(state, scene),
          resetToBaseline: () => this.resetToBaseline(),
          pause: duration => this.wait(duration),
          destroy,
        })
      }

      private cameraTarget() {
        const width = parent.clientWidth, height = parent.clientHeight
        const zoom = this.focused && this.focus
          ? Math.min(this.focus.zoom, width / 420, height / 360, 1.5)
          : Math.min(width < 760 ? width / 560 : width / 900, height / 680, 1.25)
        const screenX = this.focused || width < 760 ? width * 0.5 : width * 0.76
        const screenY = this.focused ? height * 0.35 : height * (width < 760 ? 0.78 : 0.48)
        const focusX = 1000 + (this.focused ? this.focus?.x ?? 0 : 0)
        const focusY = 700 + (this.focused ? this.focus?.y ?? 0 : 0)
        return { zoom, scrollX: focusX - width / 2 - (screenX - width / 2) / zoom,
          scrollY: focusY - height / 2 - (screenY - height / 2) / zoom }
      }

      private layout() {
        const target = this.cameraTarget()
        this.cameras.main.setZoom(target.zoom).setScroll(target.scrollX, target.scrollY)
      }

      private drawState() {
        const haze = (this.state.transport + this.state.agriculture + this.state.energy) / 3
        this.haze.setAlpha(haze * 0.85)
        this.farmland.setDisplaySize(45 + this.state.agriculture * 75, 45 + this.state.agriculture * 75)
        this.habitat.setDisplaySize(30 + this.state.habitat * 90, 30 + this.state.habitat * 90)
        this.water.setDisplaySize(25 + (1 - this.state.water) * 53, 25 + (1 - this.state.water) * 53)
        this.sun.setAlpha(0.2 + (1 - this.state.energy) * 0.8)
        this.wind.setAlpha(0.2 + (1 - this.state.energy) * 0.8)
        this.factory.setAlpha(0.15 + this.state.energy * 0.85)
        this.waste.forEach((item, i) => item.setAlpha(Phaser.Math.Clamp(this.state.waste * 4 - i, 0, 1)))
        this.flowers.forEach((item, i) => item.setAlpha(Phaser.Math.Clamp(this.state.habitat * 3 - i, 0, 1)))
      }

      private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
        return new Promise((done, fail) => {
          if (signal.aborted) { fail(cancelled()); return }
          const cancel = (error: Error) => { tween.stop(); fail(error) }
          const tween = this.tweens.add({
            ...config,
            onComplete: () => { pending.delete(cancel); done() },
          })
          pending.add(cancel)
        })
      }

      private async moveCamera(focused: boolean) {
        this.focused = focused
        if (!focused) this.focus = null
        await this.tween({ targets: this.cameras.main, ...this.cameraTarget(),
          duration: 850, ease: 'Sine.easeInOut' })
        this.layout()
      }

      private async moveCameraTo(focus: CameraTarget, duration: number) {
        this.focused = true
        this.focus = focus
        await this.tween({ targets: this.cameras.main, ...this.cameraTarget(),
          duration, ease: 'Sine.easeInOut' })
        this.layout()
      }

      private animateObject(animation: ObjectAnimation, duration: number) {
        const item = this.objects.get(animation.object)
        if (!item) throw new Error(`Unknown Earth object "${animation.object}" in answer scene.`)
        const { scale, ...pose } = animation.to
        const home = this.objectHomes.get(animation.object)!
        return this.tween({
          targets: item,
          ...pose,
          ...(scale === undefined ? {} : { scaleX: home.scaleX * scale, scaleY: home.scaleY * scale }),
          duration: animation.duration ?? duration,
          ease: 'Sine.easeInOut',
        })
      }

      private async showStep(state: EarthState, scene: AnswerScene) {
        const animations = scene.objects ?? []
        for (const animation of animations) {
          if (!this.objects.has(animation.object)) {
            throw new Error(`Unknown Earth object "${animation.object}" in answer scene.`)
          }
        }
        const duration = scene.duration ?? 1300
        await Promise.all([
          this.moveCameraTo(scene.camera, duration),
          this.tween({ targets: this.state, ...state, duration,
            ease: 'Sine.easeInOut', onUpdate: () => this.drawState() }),
          ...animations.map(animation => this.animateObject(animation, duration)),
        ])
        this.drawState()
      }

      private async resetToBaseline() {
        this.state = { ...baseline }
        for (const [id, item] of this.objects) {
          const home = this.objectHomes.get(id)!
          item.setPosition(home.x, home.y).setAlpha(home.alpha)
            .setScale(home.scaleX, home.scaleY).setAngle(home.angle)
        }
        this.drawState()
        await this.moveCameraTo({ x: 0, y: 0, zoom: 1.2 }, 850)
      }

      private wait(duration: number): Promise<void> {
        return new Promise((done, fail) => {
          if (signal.aborted) { fail(cancelled()); return }
          const cancel = (error: Error) => { timer.remove(false); fail(error) }
          const timer = this.time.delayedCall(duration, () => {
            pending.delete(cancel)
            done()
          })
          pending.add(cancel)
        })
      }
    }

    try {
      game = new Phaser.Game({
        type: Phaser.AUTO, parent, backgroundColor: '#102e30',
        scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
        scene: EarthScene, audio: { noAudio: true },
      })
    } catch (error) {
      reject(error)
      destroy()
    }
  })
}
