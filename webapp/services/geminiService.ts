import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface OrderAnalysis {
    summary: string;
    estimatedPrice: number;
    nutritionTip: string;
}

export const analyzeOrderText = async (text: string): Promise<OrderAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `分析以下外卖订单文本，提取关键信息。如果是胡言乱语或不是食物，请礼貌指出。\n\n用户输入: "${text}"`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: '订单内容的简短总结，例如"两份牛肉面和一杯可乐"' },
                        estimatedPrice: { type: Type.NUMBER, description: '预估总价格（人民币），基于中国外卖市场均价估算' },
                        nutritionTip: { type: Type.STRING, description: '关于这顿饭的简单营养建议或点评，50字以内' },
                    },
                    required: ['summary', 'estimatedPrice', 'nutritionTip'],
                },
            },
        });

        const jsonStr = response.text;
        if (!jsonStr) return null;
        return JSON.parse(jsonStr) as OrderAnalysis;
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return { summary: 'AI 分析服务暂时不可用', estimatedPrice: 0, nutritionTip: '请稍后重试' };
    }
};
