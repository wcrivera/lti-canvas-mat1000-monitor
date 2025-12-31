import axios, { AxiosInstance } from 'axios';
import { CanvasQuiz, CanvasQuizSubmission, CanvasUser } from '../types';

export class CanvasService {
  private client: AxiosInstance | null = null;
  private baseUrl: string = '';
  private token: string = '';
  private configured: boolean = false;

  constructor() {
    // NO hacer nada en el constructor
  }

  private initialize(): void {
    if (this.configured) return;

    this.baseUrl = process.env.CANVAS_API_URL || '';
    this.token = process.env.CANVAS_ACCESS_TOKEN || '';

    if (!this.baseUrl || !this.token || this.token.includes('temporal')) {
      console.warn('⚠️  Canvas no configurado - polling deshabilitado');
      return;
    }

    this.client = axios.create({
      baseURL: this.baseUrl, // Ya incluye /api/v1 si está en .env
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    this.configured = true;
    console.log('✅ Canvas API configurado');
  }

  public isReady(): boolean {
    this.initialize();
    return this.configured && this.client !== null;
  }

  private ensureReady(): void {
    this.initialize();
    if (!this.configured || !this.client) {
      throw new Error('Canvas API no configurado en .env');
    }
  }

  async getQuiz(courseId: string, quizId: string): Promise<CanvasQuiz> {
    this.ensureReady();
    // NO incluir /api/v1 aquí, ya está en baseURL
    const url = `/courses/${courseId}/quizzes/${quizId}`;
    const response = await this.client!.get<CanvasQuiz>(url);
    return response.data;
  }

  async getQuizSubmissions(courseId: string, quizId: string): Promise<CanvasQuizSubmission[]> {
    this.ensureReady();
    // NO incluir /api/v1 aquí, ya está en baseURL
    const url = `/courses/${courseId}/quizzes/${quizId}/submissions`;
    const response = await this.client!.get<{ quiz_submissions: CanvasQuizSubmission[] }>(url, {
      params: {
        'per_page': 100,
        'include[]': ['submission', 'quiz', 'user']
      }
    });
    return response.data.quiz_submissions || [];
  }

  async getUser(userId: string): Promise<CanvasUser> {
    this.ensureReady();
    // NO incluir /api/v1 aquí, ya está en baseURL
    const url = `/users/${userId}/profile`;
    const response = await this.client!.get<CanvasUser>(url);
    return response.data;
  }

  async getCourseQuizzes(courseId: string): Promise<CanvasQuiz[]> {
    this.ensureReady();
    // NO incluir /api/v1 aquí, ya está en baseURL
    const url = `/courses/${courseId}/quizzes`;
    const response = await this.client!.get<CanvasQuiz[]>(url, {
      params: { per_page: 100 }
    });
    return response.data;
  }
}

export const canvasService = new CanvasService();