import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinaryV2 } from 'cloudinary'

// Получаем переменные окружения и утверждаем, что они будут строками
const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string
const apiKey = process.env.CLOUDINARY_API_KEY as string
const apiSecret = process.env.CLOUDINARY_API_SECRET as string

// Настройка Cloudinary
cloudinaryV2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export async function GET(req: NextRequest) {
  try {
    // Генерация подписанных параметров для загрузки
    const timestamp = Math.floor(Date.now() / 1000)
    const uploadPreset = 'uoj4myvr'
    const params = {
      timestamp,
      uploadPreset,
    }

    // Генерация подписи для безопасной загрузки
    const signature = cloudinaryV2.utils.api_sign_request(params, apiSecret)

    // Формирование ответа с параметрами для клиента
    const signedParams = {
      signature,
      api_key: apiKey,
      timestamp,
      uploadPreset,
    }

    return NextResponse.json(signedParams)
  } catch (error) {
    return NextResponse.json({ error: 'Error generating signed parameters' }, { status: 500 })
  }
}
