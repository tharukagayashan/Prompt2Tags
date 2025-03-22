require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

const getPrompt = async (prompt, channelName, targetAudience, videoType) => {
    const promptMsg = `
    Generate top ranking, SEO friendly Title, Tags, Hashtags, Description for this prompt "${prompt}".

    * Channel Name: ${channelName}
    * Audience    : ${targetAudience}
    * Video Type  : ${videoType}

    Information:
    -Title : Should be more informative and less than 70 characters. Don't use channel name to the title (SEO friendly)
    -Tags : Should be min 400 and max 500 characters. and comma separated and lowercase (SEO friendly)
    -Hashtags : Should be min 1000 and max 5000 characters. and space separated and lowercase (SEO friendly)
    -Description : Should be min 1000 and max 5000 characters. Need to be more informative and include the title, tags (only channel name tag and matching 4 tags), and hashtags(only channel name hashtag and matching 4 hashtags) with beautiful emojis (SEO friendly)

    Output Format (JSON Object):
    {
        "title": "String",
        "tags": "[String]",
        "hashtags": "[String]",
        "description": "String"
    }

    Instructions:
    - Remove any special characters from the title, tags, and hashtags
    - Remember the target audience while generating the tags, hashtags, title and description.
    - Remember the video type while generating the tags, hashtags, title and description.
    - Tags should be comma separated
    - Tags and Hashtags should be in lowercase
    - Tags and Hashtags should not contain any special characters
    - Hashtags should not contain any spaces
    - Tags should contain spaces
    - Description should contain the title, tags, and hashtags
    - Description should contain beautiful emojis
    - Description should be informative
    - Description should very attractive and well formatted
    - Don't use channel name in the title
    - Add some common popular tags and hashtags to the tags and hashtags
    - Discription should seperate by paragraphs. and description should need to copy and paste directly to the youtube video description. So it should be well formatted and attractive. Don't use any special characters in the description. [Note: You can use emojis in the description]
    - If the video type is "Shorts" then the title should be less than 60 characters and add #shorts and #short like common hashtags in the description
    - You can return the output in any format as long as it follows the above instructions
    - Use clear, non-expert language.
    - Return ONLY a valid JSON object. no need any symbol or text
    - Structure the response as a valid JSON object with the specified keys.
    `

    return promptMsg
}

const getGenerateContent = async (prompt, channelName, targetAudience, videoType) => {
    const fullPrompt = await getPrompt(prompt, channelName, targetAudience, videoType);

    const result = await model.generateContent(fullPrompt);
    const unclearJson = result.response.candidates[0].content.parts[0].text;

    const clearJson = extractJsonObject(unclearJson.toString());

    return { clearJson };
};

function extractJsonObject(input) {
    try {
        if (!input || typeof input !== "string") {
            throw new Error("Invalid input: expected a JSON string.");
        }

        const match = input.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            return JSON.parse(match[1]);
        } else {
            throw new Error("JSON format not found.");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error.message);
        return null;
    }
}

module.exports = {
    getGenerateContent
}