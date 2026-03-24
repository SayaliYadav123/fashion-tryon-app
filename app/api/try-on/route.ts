import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

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

    const google = createGoogleGenerativeAI({
      apiKey: process.env.AI_GATEWAY_TOKEN!,
      baseURL: `https://gateway.ai.vercel.sh/v1/${process.env.VERCEL_TEAM_ID}/${process.env.VERCEL_PROJECT_ID}/google`,
    })

    const result = await generateText({
      model: google('gemini-2.0-flash-exp', {
        responseModalities: ['image', 'text'],
      } as never),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Treat Photo A as the person to keep unchanged (face, body, pose, hair, skin tone, background). Treat Photo B as the outfit to apply. Replace only the clothing in Photo A with the outfit from Photo B. Match fit, drape, lighting, and shadows so it looks natural. Output one high-resolution image.`,
            },
            {
              type: 'image',
              image: `data:${personMediaType};base64,${personBase64}`,
            },
            {
              type: 'image',
              image: `data:${outfitMediaType};base64,${outfitBase64}`,
            },
          ],
        },
      ],
    })

    const images = []
    if (result.files) {
      for (const file of result.files) {
        if (file.mediaType?.startsWith('image/')) {
          images.push({ base64: file.base64, mediaType: file.mediaType })
        }
      }
    }

    if (images.length === 0) {
      return Response.json({ error: 'No image generated' }, { status: 500 })
    }

    return Response.json({ image: images[0], text: result.text })

  } catch (error) {
    console.error('Try-on error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
