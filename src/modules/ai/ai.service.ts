import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../metrics/metrics.service';

type ChatMessage = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

type StressLevel = 'low' | 'medium' | 'high';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async analyzeMood(clerkId: string, messages: ChatMessage[]) {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    const normalized = lastUserMessage.toLowerCase();

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

    let assistantMessage =
      'Gracias por contarme cómo te sientes. Estoy aquí para ayudarte a cuidar tu bienestar.\n\n';

    switch (stressLevel) {
      case 'high':
        assistantMessage +=
          'Parece que hoy tu nivel de estrés es alto. ¿Qué fue lo que más te cargó durante el día? Podemos buscar una pequeña acción para descargar un poco esa tensión.';
        break;
      case 'medium':
        assistantMessage +=
          'Percibo algo de tensión en tu día. ¿Qué parte sientes que podrías cambiar o hacer más ligera? A veces un pequeño ajuste marca la diferencia.';
        break;
      default:
        assistantMessage +=
          'Me alegra que te sientas relativamente bien. ¿Hay algo que te haya hecho sentir especialmente bien hoy que quieras repetir más seguido?';
        break;
    }

    await this.metricsService.recordEmotion(clerkId, {
      emotion,
      confidence,
    });

    return {
      assistantMessage,
      emotion,
      stressLevel,
      confidence,
    };
  }
}

