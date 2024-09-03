import { ChangeDetectionStrategy, Component, computed, signal, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgFor, NgIf } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

export interface Category {
  name: string;
  id: string;
  isChecked: boolean;
  subCategories?: Category[];
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatIconModule, MatButtonModule,
    FormsModule,
    NgFor, NgIf,
    MatDividerModule,
    MatCardModule,
    MatSliderModule,
    MatButtonToggleModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EducationComponent {
  sliderValue = 70;
  selectedValue = 'test';

  constructor(private router: Router) { }

  readonly panelOpenState = signal(false);
  readonly categories = signal<Category[]>([
    {
      name: 'Waffenrecht und sonstige Rechtsvorschriften',
      id: "WAFFENRECHT",
      isChecked: true,
      subCategories: [
        { name: 'Begriffe des Waffenrechts', isChecked: true, id: "BEGRIFFE" },
        { name: 'Rechte und Pflichten', isChecked: true, id: "RECHTE_PFLICHTEN" },
        { name: 'Kennzeichnung von Schusswaffen und Munition', isChecked: true, id: "KENNZEICHNUNG" },
        { name: 'Aufbewahrung von Schusswaffen und Munition', isChecked: true, id: "AUFBEWAHRUNG" },
        { name: 'Notwehr und Notstand', isChecked: true, id: "NOTWEHR" },
      ],
    },
    {
      name: "Waffentechnik (Waffen, Munition, Geschosse)",
      id: "WAFFENTECHNIK",
      isChecked: true
    },
    {
      name: "Handhabung von Schusswaffen und Munition",
      id: "HANDHABUNG",
      isChecked: true
    },
    {
      name: "Not- und Seenotsignalmittel",
      id: "SEENOT",
      isChecked: false
    }
  ]);

  readonly partiallyComplete = computed(() => {
    return this.categories().some(category =>
      category.subCategories?.some(c => c.isChecked) && !category.subCategories.every(c => c.isChecked)
    );
  });

  update(isChecked: boolean, categoryIndex: number, subCategoryIndex?: number) {
    this.categories.update(categories => {
      const category = categories[categoryIndex];
      if (subCategoryIndex === undefined) {
        category.isChecked = isChecked;
        category.subCategories?.forEach(c => (c.isChecked = isChecked));
      } else {
        category.subCategories![subCategoryIndex].isChecked = isChecked;
        category.isChecked = category.subCategories?.every(c => c.isChecked) ?? true;
      }
      return [...categories];
    });
  }

  isCategoryIndeterminate(category: Category): boolean {
    return category.subCategories ?
      category.subCategories.some(c => c.isChecked) && !category.subCategories.every(c => c.isChecked) : false;
  }

  start() {
    const selectedCategories = this.categories();
    const categoryNames = selectedCategories.flatMap(category => {
      // Check if category.subCategories is defined and has a length greater than 0
      if (category.subCategories?.length) {
        // Filter out only the checked subCategories
        const checkedSubCategories = category.subCategories.filter(sub => sub.isChecked);
        // Return the names of checked subCategories if there are any
        return checkedSubCategories.length > 0 ? checkedSubCategories.map(sub => sub.id) : [];
      } else {
        // If category.subCategories is undefined or has length 0, include the category name if checked
        return category.isChecked ? [category.id] : [];
      }
    });
    console.log('Exam: ' +(this.selectedValue === 'exam') );
    this.router.navigate(['/train'], { state: { categoryNames, sliderValue: this.sliderValue, isExam: (this.selectedValue === 'exam') } });

  }

}
