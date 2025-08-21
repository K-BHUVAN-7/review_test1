import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[decimalNumbersOnly]',
  standalone: true
})
export class DecimalNumbersOnlyDirective {

  @Input() decimalPlaces: number = 2;  // Default to 2 decimal places

  private navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste'
  ];

  inputElement: HTMLElement;

  constructor(public el: ElementRef) {
    this.inputElement = el.nativeElement;
  }

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
    const inputValue = (this.inputElement as HTMLInputElement).value;

    // Allow navigation keys and shortcuts
    if (
      this.navigationKeys.indexOf(e.key) > -1 ||
      (e.key === 'a' && (e.ctrlKey || e.metaKey)) ||
      (e.key === 'c' && (e.ctrlKey || e.metaKey)) ||
      (e.key === 'v' && (e.ctrlKey || e.metaKey)) ||
      (e.key === 'x' && (e.ctrlKey || e.metaKey))
    ) {
      return;
    }

    // Allow one decimal point
    if (e.key === '.' && !inputValue.includes('.')) {
      return;
    }

    // Restrict digits after decimal (if already has a decimal point)
    if (inputValue.includes('.')) {
      const parts = inputValue.split('.');
      if (parts[1].length >= this.decimalPlaces && (e.key >= '0' && e.key <= '9')) {
        e.preventDefault();
        return;
      }
    }

    // Block non-numeric keys
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    const sanitizedInput = this.sanitizeInput(pastedInput);
    document.execCommand('insertText', false, sanitizedInput);
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    const textData = event.dataTransfer?.getData('text') || '';
    const sanitizedText = this.sanitizeInput(textData);
    this.inputElement.focus();
    document.execCommand('insertText', false, sanitizedText);
  }

  private sanitizeInput(value: string): string {
    // Remove invalid chars, allow only one dot, and trim decimal places
    let sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    if (sanitized.includes('.')) {
      const [intPart, decPart] = sanitized.split('.');
      sanitized = intPart + '.' + decPart.substring(0, this.decimalPlaces);
    }
    return sanitized;
  }
}
