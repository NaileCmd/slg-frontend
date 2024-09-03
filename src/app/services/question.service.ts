import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../model/question.model';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private baseUrl = environment.questionApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // GET /api/question
  listQuestions(limit?: number, params?: any): Observable<Question[]> {
    let queryParams = new HttpParams();
    if (limit) {
      queryParams = queryParams.set('limit', limit.toString());
    }
    if (params) {
      Object.keys(params).forEach(key => {
        queryParams = queryParams.set(key, params[key]);
      });
    }
    return this.http.get<Question[]>(`${this.baseUrl}`, { params: queryParams });
  }

  // GET /api/question/training
  listTrainingQuestions(limit: number, categories?: string[]): Observable<Question[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (categories && categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }
    return this.http.get<Question[]>(`${this.baseUrl}/training`, { params });
  }

  // GET /api/question/{id}
  getQuestionById(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`);
  }

}
