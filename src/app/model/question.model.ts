export interface Question {
  id: string;
  externalId: string;
  category: string;
  subCategory: string;
  question: string;
  answer: string;
  mustKeywords: string[];
  answers: Answer[];
  errorValue: number;
  isExamRelevant: boolean;
}

export interface Answer {
  id: string;
  answer: string;
  isChecked: boolean;
}
