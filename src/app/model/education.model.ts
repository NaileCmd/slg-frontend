import { SafeHtml } from "@angular/platform-browser";
import { Question } from "./question.model";

export interface NavigationParameter {
    limit: number;
    categories: string[];
    isExam: boolean;
}

export interface QuestionResult extends Question {
    givenAnswer: string,
    givenAnswers: boolean[];
    formattedAnswer: SafeHtml;
    missingKeywords: RegExp[];
    isCorrect: boolean;
    isValidated: boolean;
    isAnswered: boolean;
}

export interface TestResult {
    
    questionResultList: QuestionResult[],
    startDate: Date;
    endDate: Date;
    inCorrectQuestions: number;
    passedTest: boolean;
    isExam: boolean;
    questionAmount: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;    
    requiredTime: string;
}
