import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  async analyzeSentiment(text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'ai_service', 'sentiment_analysis.py');

      // Obtener el ejecutable de Python desde .env
      // Por defecto 'python', pero en Linux/Mac puede ser 'python3'
      const pythonExecutable = this.configService.get<string>('PYTHON_EXECUTABLE', 'python');

      const pythonProcess = spawn(pythonExecutable, [scriptPath, text], {
        shell: false
      });

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script error: ${errorString}`);
          return reject(new InternalServerErrorException('Failed to analyze sentiment'));
        }

        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          reject(new InternalServerErrorException('Invalid response from AI model'));
        }
      });
    });
  }

  getHello(): string {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    return `DigitalPause Backend is running! (${env})`;
  }
}