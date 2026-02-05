import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../metrics/metrics.service';
import { spawn } from 'child_process';
import * as path from 'path';

type ChatMessage = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

type StressLevel = 'low' | 'medium' | 'high';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async analyzeMood(clerkId: string, messages: ChatMessage[]) {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    try {
      this.logger.log(`Attempting Python analysis for text: "${lastUserMessage.substring(0, 50)}..."`);
      return await this.analyzeWithPython(clerkId, lastUserMessage);
    } catch (error) {
      this.logger.warn(`Python analysis failed, falling back to basic analysis: ${error.message}`);
      return this.analyzeWithKeywords(clerkId, lastUserMessage);
    }
  }

  private async analyzeWithPython(clerkId: string, text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Assuming the script is in /ai_service/sentiment_analysis.py relative to project root
      // and we are running from dist/src/modules/ai/ or similar.
      // Safer to use process.cwd()
      const scriptPath = path.join(process.cwd(), 'ai_service', 'sentiment_analysis.py');
      
      const pythonProcess = spawn('python', [scriptPath, text]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${errorString}`));
          return;
        }

        try {
          const result = JSON.parse(dataString);
          this.logger.log(`Python analysis result: ${JSON.stringify(result)}`);
          
          const stars = result.stars; // 1-5
          const confidence = result.confidence;

          let emotion = 'neutral';
          let stressLevel: StressLevel = 'low';

          // Map stars to emotion/stress
          if (stars === 1) {
            emotion = 'frustration';
            stressLevel = 'high';
          } else if (stars === 2) {
            emotion = 'sadness';
            stressLevel = 'medium';
          } else if (stars === 3) {
            emotion = 'neutral';
            stressLevel = 'low';
          } else if (stars === 4) {
            emotion = 'calm';
            stressLevel = 'low';
          } else if (stars === 5) {
            emotion = 'joy';
            stressLevel = 'low';
          }

          const response = await this.generateResponse(stressLevel, emotion, confidence, clerkId);
          resolve(response);

        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}`));
        }
      });
    });
  }

  private async analyzeWithKeywords(clerkId: string, text: string) {
    const normalized = text.toLowerCase();

    let emotion = 'neutral';
    let stressLevel: StressLevel = 'low';
    let confidence = 0.6;

    if (
      normalized.includes('estres') ||
      normalized.includes('estrés') ||
      normalized.includes('estresado') ||
      normalized.includes('estresada') ||
      normalized.includes('agotado') ||
      normalized.includes('agotada') ||
      normalized.includes('ansioso') ||
      normalized.includes('ansiosa')
    ) {
      emotion = 'stress';
      stressLevel = 'high';
      confidence = 0.85;
    } else if (
      normalized.includes('triste') ||
      normalized.includes('cansado') ||
      normalized.includes('cansada') ||
      normalized.includes('abrumado') ||
      normalized.includes('abrumada') ||
      normalized.includes('mal')
    ) {
      emotion = 'sadness';
      stressLevel = 'medium';
      confidence = 0.8;
    } else if (
      normalized.includes('bien') ||
      normalized.includes('tranquilo') ||
      normalized.includes('tranquila') ||
      normalized.includes('feliz') ||
      normalized.includes('relajado') ||
      normalized.includes('relajada')
    ) {
      emotion = 'calm';
      stressLevel = 'low';
      confidence = 0.8;
    }

    return this.generateResponse(stressLevel, emotion, confidence, clerkId);
  }

  private async generateResponse(stressLevel: StressLevel, emotion: string, confidence: number, clerkId: string) {
    // Record the emotion metric first
    await this.metricsService.recordEmotion(clerkId, {
      emotion,
      confidence,
    });

    // Use OpenAI to generate a contextual, empathetic response based on the analysis
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn('OPENAI_API_KEY not found, falling back to static response');
        throw new Error('No API Key');
      }

      const prompt = `
        Actúa como "MindPause", un compañero de bienestar digital empático y cálido.
        
        Contexto del usuario:
        - Emoción detectada por análisis biométrico/texto: ${emotion} (Confianza: ${Math.round(confidence * 100)}%)
        - Nivel de estrés estimado: ${stressLevel}
        
        Instrucción:
        Genera una respuesta breve (máximo 2-3 frases) para el usuario.
        Valida su emoción sin ser robótico.
        Si el estrés es alto, sugiere suavemente una pausa respiratoria.
        Si es bajo/positivo, celebra el momento.
        
        Tono: Cercano, tranquilo, no clínico.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: 'Genera la respuesta ahora.' }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Gracias por compartir. Estoy aquí para escucharte.';

      return {
        assistantMessage,
        emotion,
        stressLevel,
        confidence,
      };

    } catch (error) {
      this.logger.error(`Failed to generate AI response: ${error.message}`);
      
      // Fallback to static response if OpenAI fails
      let assistantMessage = 'Gracias por contarme cómo te sientes. ';
      if (stressLevel === 'high') {
        assistantMessage += 'Noto que hay mucha carga hoy. ¿Te gustaría tomarte un minuto para respirar?';
      } else if (stressLevel === 'medium') {
        assistantMessage += 'Parece un día retador. Recuerda que paso a paso se llega lejos.';
      } else {
        assistantMessage += 'Me alegra saber que estás bien. ¡Sigue cuidando de ti!';
      }

      return {
        assistantMessage,
        emotion,
        stressLevel,
        confidence,
      };
    }
  }
}

