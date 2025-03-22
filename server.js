const express = require('express');
const bp = require('body-parser');
require('dotenv').config();

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const SERVER_PORT = process.env.SERVER_PORT || 5000;

const genAIService = require('./GeminiService');

app.post('/generate', async (req, res) => {
    const prompt = req.body.prompt;
    const channelName = req.body.channelName;
    const targetAudience = req.body.targetAudience;
    const videoType = req.body.videoType;
    const platform = req.body.platform;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!channelName) {
        return res.status(400).json({ message: 'Channel name is required' });
    }

    if (!targetAudience) {
        return res.status(400).json({ message: 'Target audience is required' });
    }

    if (!videoType) {
        return res.status(400).json({ message: 'Video type is required (Shorts or Long)' });
    }

    if (!platform) {
        return res.status(400).json({ message: 'Platform is required' });
    }

    try {
        const result = await genAIService.getGenerateContent(prompt, channelName, targetAudience, videoType, platform);
        return res.status(200).json({ result: result.clearJson });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});