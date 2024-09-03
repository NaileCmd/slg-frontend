import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionResult, TestResult } from '../model/education.model';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardSubtitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-testresult',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass,
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatIcon,
    MatAccordion, MatExpansionModule, MatSlideToggleModule, MatFormFieldModule,
    MatRadioModule, FormsModule, MatCheckboxModule, MatSlideToggleModule,
    MatCard, MatCardContent, MatCheckbox, MatCardHeader, MatCardTitle, MatCardSubtitle,
    MatFormFieldModule, MatInputModule, FormsModule,
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  templateUrl: './testresult.component.html',
  styleUrl: './testresult.component.css'
})


export class TestResultComponent {
  onlyWrong = true;
  testResult: TestResult | null = null;
  filteredQuestionResultList: QuestionResult[];

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { testResult: TestResult };
    this.testResult = state.testResult;
    this.filteredQuestionResultList = this.testResult.questionResultList.filter(question => !question.isCorrect);
  }

  applyFilter() {
    if (this.testResult) {
      if (this.onlyWrong) {
        this.filteredQuestionResultList = this.testResult.questionResultList.filter(question => !question.isCorrect);
      } else {
        this.filteredQuestionResultList = this.testResult.questionResultList;
      }
    }
    console.log('Filter: ' + this.filteredQuestionResultList.length);
  }

  getCheckboxClass(question: QuestionResult, index: number): string {
    return (question.answers[index].isChecked === (question?.givenAnswers[index] ?? false))
      ? 'correct-checkbox'
      : 'incorrect-checkbox';
  }

}