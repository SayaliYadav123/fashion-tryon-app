export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const personImage = formData.get('personImage') as File
    const outfitImage = formData.get('outfitImage') as File

    if (!personImage || !outfitImage) {
      return Response.json({ error: 'Both images are required' }, { status: 400 })
    }

    const personBuffer = await personImage.arrayBuffer()
    const outfitBuffer = await outfitImage.arrayBuffer()
    const personBase64 = Buffer.from(personBuffer).toString('base64')
    const outfitBase64 = Buffer.from(outfitBuffer).toString('base64')
    const personMediaType = personImage.type || 'image/jpeg'
    const outfitMediaType = outfitImage.type || 'image/jpeg'

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        max_tokens: 6000,
        modalities: ['image', 'text'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Swap the outfit only. Keep the person's face, pose, body, and background identical. Apply the clothing from Photo B onto the person in Photo A. Make it look natural and realistic.`
                // text: `Treat Photo A as the person to keep unchanged (face, body, pose, hair, skin tone, background). Treat Photo B as the outfit to apply. Replace only the clothing in Photo A with the outfit from Photo B. Match fit, drape, lighting, and shadows so it looks natural. Output one high-resolution image.`
              },
              {
                type: 'image_url',
                image_url: { url: `data:${personMediaType};base64,${personBase64}` }
              },
              {
                type: 'image_url',
                image_url: { url: `data:${outfitMediaType};base64,${outfitBase64}` }
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    console.log('OpenRouter response:', JSON.stringify(data, null, 2))

    // Extract image from OpenRouter response
    // Format: data.choices[0].message.images[0].image_url.url
    const images = data.choices?.[0]?.message?.images
    if (images && images.length > 0) {
      const imageUrl = images[0]?.image_url?.url as string
      const base64 = imageUrl.replace(/^data:image\/\w+;base64,/, '')
      const mediaType = imageUrl.match(/^data:(image\/\w+);/)?.[1] || 'image/png'
      return Response.json({ image: { base64, mediaType } })
    }

    return Response.json({ 
      error: data.error?.message || 'No image generated',
    }, { status: 500 })

  } catch (error) {
    console.error('Try-on error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
