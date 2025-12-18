import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Solve image-based CAPTCHA using vision capabilities
export async function solveCaptchaImage(imageBase64: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a CAPTCHA solving assistant. Analyze the image and extract the text or solve the challenge. Return ONLY the solution text, nothing else.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Solve this CAPTCHA. Return only the text/characters you see, nothing else.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") 
                  ? imageBase64 
                  : `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 100,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Failed to solve CAPTCHA:", error);
    throw new Error("CAPTCHA solving failed");
  }
}

// Solve text-based CAPTCHA
export async function solveCaptchaText(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are solving CAPTCHA challenges. Answer concisely with just the answer.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_completion_tokens: 50,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Failed to solve text CAPTCHA:", error);
    throw new Error("Text CAPTCHA solving failed");
  }
}

// Transcribe text from image for typing jobs
export async function transcribeImage(imageBase64: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a text transcription assistant. Extract all visible text from the image exactly as it appears, preserving formatting where possible.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe all the text visible in this image. Preserve the original formatting.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") 
                  ? imageBase64 
                  : `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Failed to transcribe image:", error);
    throw new Error("Image transcription failed");
  }
}

// Data entry processing
export async function processDataEntry(sourceData: string, format: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a data entry assistant. Convert the provided data into the requested format. Be precise and maintain data integrity.`,
        },
        {
          role: "user",
          content: `Convert the following data to ${format} format:\n\n${sourceData}`,
        },
      ],
      max_completion_tokens: 4096,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Failed to process data entry:", error);
    throw new Error("Data entry processing failed");
  }
}
