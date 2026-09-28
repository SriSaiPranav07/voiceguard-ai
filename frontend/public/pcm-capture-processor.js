class VoiceGuardPcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const requestedSize = options.processorOptions?.chunkSamples ?? Math.round(sampleRate / 2);
    this.chunkSize = Math.max(2048, requestedSize);
    this.chunk = new Float32Array(this.chunkSize);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    for (const channel of outputs[0] ?? []) channel.fill(0);
    if (!input) return true;

    let readOffset = 0;
    while (readOffset < input.length) {
      const count = Math.min(input.length - readOffset, this.chunkSize - this.offset);
      this.chunk.set(input.subarray(readOffset, readOffset + count), this.offset);
      readOffset += count;
      this.offset += count;

      if (this.offset === this.chunkSize) {
        const completed = this.chunk;
        this.chunk = new Float32Array(this.chunkSize);
        this.offset = 0;
        this.port.postMessage(completed, [completed.buffer]);
      }
    }
    return true;
  }
}

registerProcessor('voiceguard-pcm-capture', VoiceGuardPcmCaptureProcessor);
