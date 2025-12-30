import { speakKurdish } from '../../src/lib/kurdishTTS'

// Mock fetch
global.fetch = jest.fn()

describe('Kurdish TTS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock speechSynthesis
    global.speechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      getVoices: jest.fn().mockReturnValue([]),
    } as any
  })

  it('falls back to browser TTS when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    await speakKurdish('Silav', 'Hello')

    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('uses Kurdish TTS API when available', async () => {
    const mockBlob = new Blob(['audio data'], { type: 'audio/wav' })
    const mockUrl = 'blob:http://localhost/audio-url'

    global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await speakKurdish('Silav', 'Hello')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('kurdishtts.com'),
      expect.any(Object)
    )
  })
})












