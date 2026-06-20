class MixerSoundManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgNodes: { gain: GainNode; osc: OscillatorNode; lfo: OscillatorNode; lfoGain: GainNode } | null = null

  private ensureCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.25
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  private getMaster(): GainNode {
    this.ensureCtx()
    return this.masterGain!
  }

  startBgMusic() {
    this.ensureCtx()
    const ctx = this.ctx!
    const master = this.getMaster()
    if (this.bgNodes) return

    const gain = ctx.createGain()
    gain.gain.value = 0.04
    gain.connect(master)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 55
    osc.connect(gain)
    osc.start()

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.6
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 1.8
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start()

    this.bgNodes = { gain, osc, lfo, lfoGain }
  }

  stopBgMusic() {
    if (!this.bgNodes) return
    try { this.bgNodes.osc.stop() } catch {}
    try { this.bgNodes.lfo.stop() } catch {}
    this.bgNodes.osc.disconnect()
    this.bgNodes.lfo.disconnect()
    this.bgNodes.lfoGain.disconnect()
    this.bgNodes.gain.disconnect()
    this.bgNodes = null
  }

  playLineComplete() {
    this.ensureCtx()
    const ctx = this.ctx!
    const master = this.getMaster()

    const notes = [523, 659, 784, 1047, 1319]
    const noteDuration = 0.12

    notes.forEach((freq, i) => {
      const gain = ctx.createGain()
      gain.connect(master)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)

      const t = ctx.currentTime + i * noteDuration
      gain.gain.setValueAtTime(0.28, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  }

  playAnnaAppear() {
    this.ensureCtx()
    const ctx = this.ctx!
    const master = this.getMaster()

    const gain = ctx.createGain()
    gain.connect(master)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.connect(gain)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  }

  dispose() {
    this.stopBgMusic()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }
}

export const mixerSounds = new MixerSoundManager()
