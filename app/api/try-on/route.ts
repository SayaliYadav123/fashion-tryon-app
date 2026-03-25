import { GoogleGenAI } from '@google/genai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const personImage = formData.get('personImage') as File
    const outfitImage = formData.get('outfitImage') as File

    if (!personImage || !outfitImage) {
      return Response.json(
        { error: 'Both images are required' },
        { status: 400 }
      )
    }

    const personBuffer = await personImage.arrayBuffer()
    const outfitBuffer = await outfitImage.arrayBuffer()
    const personBase64 = Buffer.from(personBuffer).toString('base64')
    const outfitBase64 = Buffer.from(outfitBuffer).toString('base64')
    const personMediaType = personImage.type || 'image/jpeg'
    const outfitMediaType = outfitImage.type || 'image/jpeg'

    const ai = new GoogleGenAI({ apiKey: process.env.AI_GATEWAY_TOKEN! })

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Treat Photo A as the person to keep unchanged (face, body, pose, hair, skin tone, background). Treat Photo B as the outfit to apply. Replace only the clothing in Photo A with the outfit from Photo B. Match fit, drape, lighting, and shadows so it looks natural. Output one high-resolution image.`
            },
            {
              inlineData: {
                mimeType: personMediaType,
                data: personBase64,
              }
            },
            {
              inlineData: {
                mimeType: outfitMediaType,
                data: outfitBase64,
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      }
    })

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || []
    let imageData = null
    let imageMediaType = 'image/png'

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data
        imageMediaType = part.inlineData.mimeType || 'image/png'
        break
      }
    }

    if (!imageData) {
      return Response.json({ error: 'No image generated' }, { status: 500 })
    }

    return Response.json({
      image: { base64: imageData, mediaType: imageMediaType }
    })

  } catch (error) {
    console.error('Try-on error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
