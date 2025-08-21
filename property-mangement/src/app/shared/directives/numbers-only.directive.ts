import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[numbersOnly]',
  standalone:true
})
export class NumberDirective {

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

  @Input() set allowNegativeValue(value:boolean) {

    if(value) this.navigationKeys.push('-');
    
  }
  
  inputElement: HTMLElement;

  constructor(public el: ElementRef) {

    this.inputElement = el.nativeElement;

  }

  @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {

    if (
      this.navigationKeys.indexOf(e.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
      (e.key == 'a' && e.ctrlKey == true) || // Allow: Ctrl+A
      (e.key == 'c' && e.ctrlKey == true) || // Allow: Ctrl+C
      (e.key == 'v' && e.ctrlKey == true) || // Allow: Ctrl+V
      (e.key == 'x' && e.ctrlKey == true) || // Allow: Ctrl+X
      (e.key == 'a' && e.metaKey == true) || // Allow: Cmd+A (Mac)
      (e.key == 'c' && e.metaKey == true) || // Allow: Cmd+C (Mac)
      (e.key == 'v' && e.metaKey == true) || // Allow: Cmd+V (Mac)
      (e.key == 'x' && e.metaKey == true) // Allow: Cmd+X (Mac)
    ) return; // let it happen, don't do anything

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault();
    
  }

  @HostListener('paste', ['$event']) onPaste(event: any) {

    event.preventDefault();

    const pastedInput: number = parseInt(event.clipboardData.getData('text/plain').replace(/[^-\d]/g, '')); // get a digit-only string

    document.execCommand('insertText', false, pastedInput as any);

  }

  @HostListener('drop', ['$event']) onDrop(event: any) {

    event.preventDefault();

    const textData = parseInt(event.dataTransfer.getData('text').replace(/[^-\d]/g, ''));

    this.inputElement.focus();

    document.execCommand('insertText', false, textData as any);

  }

}
