#!/bin/bash

# Convert all WAV files to MP3 in the kurdish-tts directory
INPUT_DIR="../frontend/public/audio/kurdish-tts"
OUTPUT_DIR="../frontend/public/audio/kurdish-tts-mp3"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🔄 Converting WAV files to MP3..."
echo "================================"
echo ""

# Count total files
total=$(find "$INPUT_DIR" -name "*.wav" | wc -l | tr -d ' ')
echo "Total WAV files: $total"
echo ""

# Counter
count=0

# Convert each WAV file to MP3
for wav_file in "$INPUT_DIR"/*.wav; do
    if [ -f "$wav_file" ]; then
        count=$((count + 1))
        filename=$(basename "$wav_file" .wav)
        output_file="$OUTPUT_DIR/${filename}.mp3"
        
        # Skip if already exists
        if [ -f "$output_file" ]; then
            echo "[$count/$total] ⏭️  Skipping: $filename (already exists)"
        else
            echo "[$count/$total] 🔄 Converting: $filename..."
            
            # Convert with ffmpeg (high quality, small size)
            ffmpeg -i "$wav_file" -codec:a libmp3lame -qscale:a 2 "$output_file" -y -loglevel error
            
            if [ $? -eq 0 ]; then
                # Get file sizes
                wav_size=$(du -h "$wav_file" | cut -f1)
                mp3_size=$(du -h "$output_file" | cut -f1)
                echo "    ✅ Done: $wav_size → $mp3_size"
            else
                echo "    ❌ Failed"
            fi
        fi
    fi
done

echo ""
echo "================================"
echo "✅ Conversion complete!"
echo "📁 MP3 files: $OUTPUT_DIR"
echo ""
echo "🎯 File size comparison:"
wav_total=$(du -sh "$INPUT_DIR" | cut -f1)
mp3_total=$(du -sh "$OUTPUT_DIR" | cut -f1)
echo "   WAV: $wav_total"
echo "   MP3: $mp3_total"

