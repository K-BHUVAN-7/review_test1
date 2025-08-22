import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injectable, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormSubmittedEvent } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

@Injectable()

export class ModalComponent implements OnInit {

  @ViewChild('modal') private modalContent!: TemplateRef<ModalComponent>;

  @Input() className: string = "";
  @Input() backdrop: any = "static";
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = "md";
  @Input() showCloseIcon : boolean = true;

  @Input() animation: boolean = true;
  @Input() centered: boolean = true;
  @Input() showSaveBtn: boolean = true;
  @Input() showCancelBtn: boolean = true;
  @Input() toggleBtn: boolean = false;
  @Input() isCustomModal: boolean = false;
  @Input() isPrint: boolean = false;
  @Input() isHeader: boolean = true;

  @Input() saveBtnTxt: string = "Save";
  @Input() closeBtnTxt: string = "Cancel";
  @Input() toggleBtnTxt: string = "";
  @Input() isFullModal: boolean = false;
  @Input() modalBodyClass: string = "";
  
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output() onPrint: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  isDisable: boolean = false;
  modalTitle: string = "";

  get disableBtn(): boolean {
    return this.isDisable;
  }
  
  @Input() set disableBtn(value: boolean) {
    this.isDisable = value;        
  }

  get title(): string {
    return this.modalTitle;
  }
  
  @Input() set title(value: string) {
    this.modalTitle = value;        
  }

  constructor(private modalService: NgbModal, private activeModal: NgbActiveModal) { }

  ngOnInit(): void { }

  open() {

    this.activeModal = this.modalService.open(
      this.modalContent,
      {
        "windowClass":"common-modal "+this.className,
        "animation":true,
        "keyboard": false,
        "backdrop":this.backdrop,
        "centered":this.centered,
        "size":this.size
      }
    );

    if(this.isFullModal) {

      let modalElement: any = document.querySelector(".modal-dialog.modal-dialog-centered");

      modalElement.removeAttribute("class");
      
      modalElement.classList.add("modal-fullscreen");
      
    }
        
  }

  close() {

    this.onClose.emit();

    this.activeModal.close();

  }

  submit() {

    this.onSubmit.emit();

  }

  print() {

    this.onPrint.emit();

  }

}
