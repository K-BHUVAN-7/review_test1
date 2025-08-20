import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-select-language',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatRadioModule
  ],
  templateUrl: './select-language.component.html',
  styleUrl: './select-language.component.scss'
})
export class SelectLanguageComponent {

  languages: Array<any> = [
    { label: 'Russian', code: 'ru' },
    { label: 'Kyrgyz', code: 'kg' },
    { label: 'English', code: 'en' }
  ];

  selectedLanguage: any = 'en';

}
