import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Cache to store previously sent content
const contentCache = new Map();

// Function to generate a cache key
const generateCacheKey = (name, categories) => {
    return `${name}-${categories.sort().join(',')}-${new Date().toDateString()}`;
};

// Function to generate content based on user preferences
export const generateContent = async (categories = [], name) => {
    try {
        console.log(`Generating content for ${name} with categories:`, categories);

        // Generate cache key
        const cacheKey = generateCacheKey(name, categories);

        // Check if we already sent this content today
        if (contentCache.has(cacheKey)) {
            console.log('Using cached content for today');
            return contentCache.get(cacheKey);
        }

        // Create a personalized prompt based on categories
        let prompt = `Generate a unique, personalized motivational message for ${name}. `;

        if (categories.includes('motivation')) {
            prompt += 'Include an inspiring quote or message about personal growth. ';
        }
        if (categories.includes('productivity')) {
            prompt += 'Add practical tips for improving productivity and time management. ';
        }
        if (categories.includes('success')) {
            prompt += 'Share a brief success story or achievement principle. ';
        }
        if (categories.includes('mindfulness')) {
            prompt += 'Include mindfulness or meditation tips for mental clarity. ';
        }

        prompt += `Make it personal, engaging, and no more than 3 paragraphs. 
                  Use ${name}'s name in the message.
                  Format the response in HTML with appropriate styling.
                  Add emojis where appropriate to make it engaging.`;

        console.log('Sending prompt to Gemini:', prompt);

        // Generate content
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Format the content with HTML styling
        const formattedContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                ${text}
                <div style="margin-top: 20px; font-style: italic; color: #666;">
                    💫 Generated specially for ${name} by Subh Chintak AI
                </div>
            </div>
        `;

        // Cache the content
        contentCache.set(cacheKey, formattedContent);

        // Clean up old cache entries (keep only today's entries)
        const today = new Date().toDateString();
        for (const [key] of contentCache) {
            if (!key.includes(today)) {
                contentCache.delete(key);
            }
        }

        console.log('Successfully generated unique content');
        return formattedContent;

    } catch (error) {
        console.error('Error generating content:', error);
        
        // Fallback content if Gemini fails
        const fallbackContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hello ${name}! 🌟</p>
                <p>Remember that each day brings new opportunities for growth and success. You have the power to make today amazing!</p>
                <p style="font-style: italic; color: #666;">
                    "The future depends on what you do today." - Mahatma Gandhi
                </p>
            </div>
        `;
        return fallbackContent;
    }
};
