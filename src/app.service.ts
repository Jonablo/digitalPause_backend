import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class AppService {
  async analyzeSentiment(text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'ai_service', 'sentiment_analysis.py');
      // Adjust 'python' to 'python3' if on linux/mac, but windows is usually 'python'
      const pythonProcess = spawn('python', [scriptPath, text]);

      
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
    return 'DigitalPause Backend is running!';
  }
}
