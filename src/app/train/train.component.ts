import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { QuestionService } from '../services/question.service';
import { Question } from '../model/question.model';
import { firstValueFrom } from 'rxjs';
import { NavigationParameter, QuestionResult, TestResult } from '../model/education.model';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-train',
  standalone: true,
  imports: [
    NgFor, NgIf, NgClass,
    MatCard, MatCardContent, MatCheckbox, MatCardHeader, MatCardTitle, MatCardSubtitle,
    MatFormFieldModule, MatInputModule, FormsModule,
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  templateUrl: './train.component.html',
  styleUrl: './train.component.scss'
})

export class TrainComponent implements OnInit, OnDestroy {
  questionService = inject(QuestionService);
  private navigationParameter: NavigationParameter;
  currentQuestionIndex: number = 0;
  currentQuestionResult: QuestionResult;
  questionResultList: QuestionResult[] = [];
  loading: boolean = true;
  startDate: Date;
  endDate: Date;
  isExam: boolean = false;
  elapsedTime: string = '00:00:00';
  countdownTime: string = '01:30:00';
  private timerInterval: any;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { categoryNames: any[], sliderValue: number, isExam: boolean };
    this.navigationParameter = {
      limit: state.sliderValue,
      categories: state.categoryNames,
      isExam: state.isExam
    };
    this.currentQuestionResult = this.getNewQuestionResult();
    this.startDate = new Date();
    this.endDate = new Date();
  }

  async ngOnInit() {
    try {
      console.log('getting catalog questions');
      const questionList = await firstValueFrom(this.questionService.listTrainingQuestions(
        this.navigationParameter.limit, this.navigationParameter.categories));
      console.log('got list');
      this.questionResultList = this.createQuestionResultList(questionList);   
      this.currentQuestionResult = this.questionResultList[0];
      this.isExam = this.navigationParameter.isExam;
      this.loading = false;
      if (this.isExam) {
        this.startCountdown();
      } else {
        this.startRegularTimer();
      }
    } catch (error) {
      console.error('Error fetching questions', error);
      this.loading = true;
      this.showErrorAndNavigateHome();
    }
  }

  private getNewQuestionResult(): { id: string; category: string; subCategory: string; externalId: string; question: string; answer: string; givenAnswer: string; formattedAnswer: string; answers: never[]; givenAnswers: never[]; mustKeywords: never[]; missingKeywords: never[]; isValidated: boolean; isCorrect: boolean; isAnswered: boolean; isExamRelevant: boolean; errorValue: number; } {
    return {
      id: "",
      category: "",
      subCategory: "",
      externalId: "",
      question: "",
      answer: "",
      givenAnswer: "",
      formattedAnswer: "",
      answers: [],
      givenAnswers: [],
      mustKeywords: [],
      missingKeywords: [],
      isValidated: false,
      isCorrect: false,
      isAnswered: false,
      isExamRelevant: false,
      errorValue: 0
    };
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  private startRegularTimer() {
    this.timerInterval = setInterval(() => {
      this.updateElapsedTime();
    }, 1000);
  }

  private updateElapsedTime() {
    const now = new Date();
    const diff = now.getTime() - this.startDate.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.elapsedTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  private startCountdown() {
    this.endDate = new Date(new Date().getTime() + 90 * 60000); // 90 minutes from now
    this.timerInterval = setInterval(() => {
      this.updateCountdownTime();
    }, 1000);
  }

  private updateCountdownTime() {
    const now = new Date();
    const diff = this.endDate.getTime() - now.getTime();
    if (diff <= 0) {
      clearInterval(this.timerInterval);
      this.countdownTime = '00:00:00';
      this.endTest();
    } else {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.countdownTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }
  }
  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  endTest() {
    let testResult: TestResult = {
      endDate: new Date(),
      questionResultList: this.questionResultList,
      startDate: this.startDate,
      inCorrectQuestions: 0,
      passedTest: true,
      isExam: this.isExam,
      questionAmount: this.questionResultList.length,
      answeredQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      requiredTime: "00:00:00"
    }
    this.questionResultList.forEach(question => {
      let questionResult: QuestionResult;

      if (!this.questionResultList.some(result => {
        if (result.id === question.id) {
          this.validateAnswer(result)
          return true;
        }
        return false;
      })) {
        questionResult = this.getNewQuestionResult();
        this.validateAnswer(questionResult)
      }
    });

    testResult.answeredQuestions = this.questionResultList.filter((question: QuestionResult) => question.isAnswered).length;
    testResult.correctAnswers = this.questionResultList.filter((question: QuestionResult) => question.isCorrect).length;
    testResult.incorrectAnswers = this.questionResultList.filter((question: QuestionResult) => !question.isCorrect).length;
    testResult.requiredTime = this.calculateRequiredTime(testResult);
    this.router.navigate(['/testresult'], { state: { testResult: testResult } });
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questionResultList.length - 1) {
      if (!this.currentQuestionResult.isValidated) {
        this.updateCurrentQuestionResultInList(this.currentQuestionResult);
      }
      console.log("list:" + JSON.stringify(this.questionResultList, null, 2));
      this.currentQuestionIndex++;
      this.currentQuestionResult = this.questionResultList[this.currentQuestionIndex];
    }
  }

  preQuestion() {
    if (this.currentQuestionIndex > 0) {
      if (!this.currentQuestionResult.isValidated) {
        this.updateCurrentQuestionResultInList(this.currentQuestionResult);
      }
      console.log("list:" + JSON.stringify(this.questionResultList, null, 2));
      this.currentQuestionIndex--;
      this.currentQuestionResult = this.questionResultList[this.currentQuestionIndex];
    }
  }

  checkAnswer() {
    console.log("check");
    console.log("Result:" + JSON.stringify(this.currentQuestionResult, null, 2));
    if (!this.currentQuestionResult?.isValidated) {         
        this.validateAnswer(this.currentQuestionResult);
    }
  }

  private validateAnswer(currentQuestionResult: QuestionResult) {
    currentQuestionResult.isValidated = true;
    if (currentQuestionResult?.answer?.length > 0) {
      this.validateTextAnswer(currentQuestionResult);
    } else {
      this.validateCheckBoxAnswers(currentQuestionResult);
    }
    this.updateCurrentQuestionResultInList(currentQuestionResult);
    console.log("Validated:" + JSON.stringify(currentQuestionResult, null, 2));
  }

  private validateCheckBoxAnswers(currentQuestionResult: QuestionResult) {
    currentQuestionResult.isCorrect = true;
    for (let i = 0; i < currentQuestionResult.answers.length; i++) {
      console.log('Answer ' + i + ': ' + currentQuestionResult.answers[i].isChecked + ' givenAnswer: ' + currentQuestionResult.givenAnswers[i]);
      if (!!currentQuestionResult.answers[i].isChecked !== !!currentQuestionResult.givenAnswers[i]) {
        currentQuestionResult.isCorrect = false;
        break;
      }
    }
  }

  private validateTextAnswer(currentQuestionResult: QuestionResult) {
    if (currentQuestionResult?.mustKeywords?.length > 0) {
      console.log("keywords: " + JSON.stringify(currentQuestionResult.mustKeywords, null, 2));
      if (currentQuestionResult.givenAnswer == null || currentQuestionResult.givenAnswer.length === 0) {
        currentQuestionResult.missingKeywords = currentQuestionResult.mustKeywords.map(keyword => this.stringToSearchRegex(keyword));
      } else {
        currentQuestionResult.isCorrect = true;
        currentQuestionResult.mustKeywords.forEach(keyword => {
          const regExp = this.stringToSearchRegex(keyword);
          if (!regExp.test(currentQuestionResult.givenAnswer)) {
            currentQuestionResult.isCorrect = false;
            currentQuestionResult.missingKeywords.push(regExp);
          }
        });
      };

      const formatRegex = (regex: RegExp): string => {
        return `/${regex.source}/${regex.flags}`;
      };

      const formattedMissingKeywords = currentQuestionResult.missingKeywords.map(formatRegex);

      console.log("missing words: " + JSON.stringify(formattedMissingKeywords, null, 2));
    } else {
      if (currentQuestionResult.answer === currentQuestionResult.givenAnswer) {
        currentQuestionResult.isCorrect = true;
      }
    }

    if (currentQuestionResult.isCorrect && currentQuestionResult.mustKeywords.length > 0 && currentQuestionResult.answer.length > 0) {
      this.formatCorrectAnswer(currentQuestionResult, currentQuestionResult);
    } else {
      this.formatIncorrectAnswer(currentQuestionResult, currentQuestionResult);
    }
  }


  getCheckboxClass(index: number): string {
    return this.currentQuestionResult.isValidated
      ? this.currentQuestionResult.answers[index].isChecked === (this.currentQuestionResult.givenAnswers[index] ?? false)
        ? 'correct-checkbox'
        : 'incorrect-checkbox'
      : '';
  }

  getAnswerClass(): string {
    return this.currentQuestionResult.isValidated
      ? this.currentQuestionResult.isCorrect
        ? 'correct-answer'
        : 'incorrect-answer'
      : '';
  }

  private formatCorrectAnswer(currentQuestion: Question, currentQuestionResult: QuestionResult) {

    const answer = currentQuestion.answer;
    const keywords = currentQuestion.mustKeywords.map(keyword => keyword.toLowerCase().trim());

    const formattedAnswer = answer.replaceAll('\n', '<br>').split(' ').map(word => {
      return keywords.includes(word.toLowerCase().trim()) ? `<strong>${word}</strong>` : word;
    }).join(' ');
    console.log("format before Dom: " + JSON.stringify(formattedAnswer, null, 2));
    currentQuestionResult.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(formattedAnswer);
  }

  private formatIncorrectAnswer(currentQuestion: Question, currentQuestionResult: QuestionResult) {

    const answer = currentQuestion.answer;
    const formattedAnswer = answer.replaceAll('\n', '<br>').split(' ').map(word => {

      let keywordFound = currentQuestionResult.missingKeywords.find(regExp => {
        return regExp.test(word);
      })
      return keywordFound !== undefined ? `<span style="color: red;">${word}</span>` : word;
    }).join(' ');
    console.log("format before Dom: " + JSON.stringify(formattedAnswer, null, 2));
    currentQuestionResult.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(formattedAnswer);
  }

  private updateCurrentQuestionResultInList(currentQuestionResult: QuestionResult) {
    if (currentQuestionResult.givenAnswers.some(answer => answer) || currentQuestionResult.givenAnswer.length > 0) {
      currentQuestionResult.isAnswered = true;
    }
  }

  private stringToSearchRegex(keyword: string): RegExp {

    let regexPattern;

    if (keyword.startsWith('!')) {

      const searchSubstring = keyword.substring(1);
      const replacedSubstring = this.replaceSpecialChars(searchSubstring);
      regexPattern = `\\b(?!${replacedSubstring}\\b).*$`;

    } else {

      if (keyword.includes('|')) {

        const substrings = keyword.split('|').map(sub => this.replaceSpecialChars(sub.trim()));
        regexPattern = `(${substrings.join('|')})`;

      } else {

        const replacedString = this.replaceSpecialChars(keyword);
        regexPattern = `${replacedString}`;

      }

    }

    return new RegExp(regexPattern, 'i');
  }

  private replaceSpecialChars(searchString: string): string {
    const specialCharsPattern = /[äüöß]/g;
    const replacementPattern = '.*';
    return searchString.replace(specialCharsPattern, replacementPattern)
  }

  private calculateRequiredTime(testResult: TestResult): string {

    const timeDiff = testResult.endDate.getTime() - testResult.startDate.getTime();
    const hours = Math.floor(timeDiff / 3600000);
    const minutes = Math.floor((timeDiff % 3600000) / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;

  }

  showErrorAndNavigateHome() {
    this.snackBar.open('Fehler beim updaten der Fragen. Weiterleitung zur Haauptseite... nach 5 Sekunden', '', {
      duration: 5000,
    });

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 5000);
  }

  private createQuestionResultList(questionList: Question[]): QuestionResult[] {
    return questionList.map(question => this.createQuestionResult(question));
  }

  private createQuestionResult(question: Question): QuestionResult {
    return {
      ...question,
      givenAnswer: '',
      givenAnswers: [],
      formattedAnswer: '' as unknown as SafeHtml,
      missingKeywords: [],
      isCorrect: false,
      isValidated: false,
      isAnswered: false
    };

  }

}
