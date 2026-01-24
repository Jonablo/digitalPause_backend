import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DigitalPause API (E2E)', () => {
  let app: INestApplication;
  const testClerkId = 'test_user_e2e';
  let createdProgramId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api - should return backend is running', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200);
    });
  });

  describe('Users API', () => {
    it('POST /api/users/bootstrap - should create/get user', () => {
      return request(app.getHttpServer())
        .post('/api/users/bootstrap')
        .send({ clerkId: testClerkId })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user_id');
          expect(res.body).toHaveProperty('created_at');
        });
    });
  });

  describe('Programs API', () => {
    it('POST /api/programs - should create a program', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/programs?clerkId=${testClerkId}`)
        .send({
          title: 'Test Program',
          startTime: '09:00',
          endTime: '10:00',
          daysOfWeek: [1, 2, 3, 4, 5],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Program');
      createdProgramId = response.body.id;
    });

    it('GET /api/programs - should list programs', () => {
      return request(app.getHttpServer())
        .get(`/api/programs?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /api/programs/:id - should get specific program', () => {
      return request(app.getHttpServer())
        .get(`/api/programs/${createdProgramId}?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdProgramId);
        });
    });

    it('PATCH /api/programs/:id/toggle - should toggle active status', () => {
      return request(app.getHttpServer())
        .patch(`/api/programs/${createdProgramId}/toggle?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isActive');
        });
    });

    it('DELETE /api/programs/:id - should delete program', () => {
      return request(app.getHttpServer())
        .delete(`/api/programs/${createdProgramId}?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deleted).toBe(true);
        });
    });
  });

  describe('Metrics API', () => {
    it('POST /api/metrics/usage - should submit usage metrics', () => {
      return request(app.getHttpServer())
        .post(`/api/metrics/usage?clerkId=${testClerkId}`)
        .send({
          usageDate: '2026-01-22',
          totalUsageSeconds: 3600,
          sessionsCount: 5,
          longestSessionSeconds: 1200,
          nightUsage: false,
        })
        .expect(201);
    });

    it('POST /api/metrics/interactions - should submit interactions', () => {
      return request(app.getHttpServer())
        .post(`/api/metrics/interactions?clerkId=${testClerkId}`)
        .send({
          recordDate: '2026-01-22',
          tapsCount: 150,
          scrollEvents: 80,
          avgScrollSpeed: 2.5,
        })
        .expect(201);
    });

    it('POST /api/emotions - should log emotion', () => {
      return request(app.getHttpServer())
        .post(`/api/emotions?clerkId=${testClerkId}`)
        .send({
          emotion: 'calm',
          confidence: 0.85,
        })
        .expect(201);
    });

    it('GET /api/emotions/summary - should get emotion summary', () => {
      return request(app.getHttpServer())
        .get(`/api/emotions/summary?clerkId=${testClerkId}`)
        .expect(200);
    });

    it('GET /api/metrics/screen-time-summary - should get screen time summary', () => {
      return request(app.getHttpServer())
        .get(`/api/metrics/screen-time-summary?clerkId=${testClerkId}`)
        .expect(200);
    });
  });

  describe('Insights API', () => {
    it('GET /api/insights - should get insights', () => {
      return request(app.getHttpServer())
        .get(`/api/insights?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /api/insights/generate - should generate insights', () => {
      return request(app.getHttpServer())
        .post(`/api/insights/generate?clerkId=${testClerkId}`)
        .expect(201);
    });
  });

  describe('Recommendations API', () => {
    it('GET /api/recommendations - should get recommendations', () => {
      return request(app.getHttpServer())
        .get(`/api/recommendations?clerkId=${testClerkId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});