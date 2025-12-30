import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AudioButton from '../../src/components/lessons/AudioButton'

// Mock the audio libraries
jest.mock('../../src/lib/kurdishTTS', () => ({
  speakKurdish: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../../src/lib/wiktionaryAudio', () => ({
  playWiktionaryAudio: jest.fn().mockResolvedValue(undefined),
}))

describe('AudioButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the play button', () => {
    render(
      <AudioButton
        kurdishText="Silav"
        phoneticText="Hello"
        label="Listen"
      />
    )

    expect(screen.getByText('Listen')).toBeInTheDocument()
  })

  it('plays audio when clicked', async () => {
    const user = userEvent.setup()
    const { speakKurdish } = require('../../src/lib/kurdishTTS')

    render(
      <AudioButton
        kurdishText="Silav"
        phoneticText="Hello"
      />
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(speakKurdish).toHaveBeenCalled()
    })
  })

  it('shows loading state when playing', async () => {
    const user = userEvent.setup()

    render(
      <AudioButton
        kurdishText="Silav"
        phoneticText="Hello"
      />
    )

    const button = screen.getByRole('button')
    await user.click(button)

    // Button should show loading/playing state
    expect(button).toBeDisabled()
  })

  it('calls onPlay callback when provided', async () => {
    const user = userEvent.setup()
    const onPlay = jest.fn()

    render(
      <AudioButton
        kurdishText="Silav"
        phoneticText="Hello"
        onPlay={onPlay}
      />
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(onPlay).toHaveBeenCalled()
    })
  })
})












