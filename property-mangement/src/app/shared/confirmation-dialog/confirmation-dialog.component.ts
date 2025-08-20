import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  
  @Input() iconClass : string = "bx bx-error fs-3";
  @Input() iconColor : string = "primary";
  @Input() title: string = "";
  @Input() type: string = "";
  @Input() subTitle: string = "";
  @Input() content: string = "";
  @Input() isContent : Boolean = false
  @Input() message: string = "";
  @Input() btnOkText: string = "Yes";
  @Input() btnCancelText: string = "Cancel";
  @Input() btnOkShow : boolean = true;
  @Input() btnCancelShow : boolean = true;
  
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  
    console.log(this.message);
    
  }

  // if status is cancel
  public decline() {
    this.activeModal.close(false);
  }

  // If status is confirm
  public accept() {
    this.activeModal.close(true);
  }

  // If press esc 
  public dismiss() {
    this.activeModal.dismiss();
  }
}
