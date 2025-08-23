import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from "lodash";
import moment from 'moment';
@Component({
  selector: 'custom-ng-select',
  templateUrl: './ng-select.component.html',
  styleUrls: ['./ng-select.component.scss']
})
export class NgSelectComponent implements OnInit {
  formGroup: FormGroup = new FormGroup({});
  formControl: string = "";
  selectedValue: any;
  masterItemList: any = [];
  itemList: any = [];
  placeholderValue: string = "Select Value";
  bindLabelName: any = "item";
  bindValueName: any = "";
  isDisabled: boolean = false;
  isClearable: boolean = false;
  showFormError: boolean = false;
  appendProperty: any = "";
  _: any = _;
  searchValue: string = "";
  ngSelectCount: number = 0;
  @Output() change = new EventEmitter(); // Emit the value of selected item
  @Output() clear = new EventEmitter(); // Emit selected list was cleared
  @Output() keyPress = new EventEmitter(); // Emit the key pressed
  @Input() multiple: boolean = false;  // ng-select is multiple or not
  
  @Input() searchable: boolean = true; // ng-select is searchable or not
  @Input() set value(value: any) { this.selectedValue = _.cloneDeep(value) }
  get value() { return this.selectedValue }
  @Input() set from(value: FormGroup) {
    this.formGroup = value;
    if(_.size(_.keys(this.formGroup.value)) > 0) this.selectedValue = _.cloneDeep(this.formGroup.get(this.formControl)?.value || "");
  }
  get from() { return this.formGroup }
  @Input() set formControlField(value: string) {
  
    this.formControl = value;
    if(_.size(_.keys(this.formGroup.value)) > 0) this.selectedValue = _.cloneDeep(this.formGroup.get(this.formControl)?.value || "");
  }
  get formControlField() { return this.formControl }
  @Input() set items(value: any) { 
    
    this.masterItemList = value 
    this.itemList = _.cloneDeep(value);
  
  }
  get items() { return this.masterItemList }
  @Input() set placeholder(value: string) { this.placeholderValue = value }
  get placeholder() { return this.placeholderValue }
  @Input() set bindLabel(value : any) { this.bindLabelName = value }
  get bindLabel() : any { return this.bindLabelName }
  @Input() set bindValue(value : any) { this.bindValueName = value }
  @Input() set disabled(value : any) { this.isDisabled = value }
  get disabled() : any { return this.isDisabled }
  @Input() set clearable(value : any) { this.isClearable = value }
  get clearable() : any { return this.isClearable }
  @Input() set showError(value : any) { this.showFormError = value }
  get showError() : any { return this.showFormError }
  @Input() set appendTo(value : any) { this.appendProperty = value }
  get appendTo() : any { return this.appendProperty }
  @Input() showInActiveBadge: boolean = false;
  constructor() {}
  ngOnInit(): void {
    
  }
  selectAll() { 
    
    this.selectedValue = this.bindValueName != '' ? _.map(this.masterItemList,this.bindValueName) : this.masterItemList; 
    
    this.valueChanged() 
  
  }
  changeSearchFn(event: any) {  
    
    this.itemList = _.filter(this.masterItemList, (item: any) => { return eval(this.bindLabelName).toLowerCase().includes(event.target.value.toLowerCase()) })
  }
  // Selection Event for Both Single and Multiselect
  valueChanged() {
    if(_.size(_.keys(this.formGroup.value)) > 0) this.formGroup.get(this.formControl)?.setValue(this.selectedValue);
    this.change.emit(this.selectedValue); // Emit the output array to the parent component
  }
  // Clear All selections
  clearAll() {
    this.selectedValue = this.multiple ? [] : "";
    if(_.size(_.keys(this.formGroup.value)) > 0) this.formGroup.get(this.formControl)?.setValue(this.selectedValue);
    this.valueChanged();
    this.clear.emit([])
  }
  getLabel(item: any) { 
    
    return this.bindLabelName != 'item' ? eval(this.bindLabelName) : item.toTitleCase() 

    // return item[this.bindLabelName] ? this.toTitleCase(item[this.bindLabelName]) : '';  
  
  }
  moment(date: string, format: string) { return moment(date).format(format) }
  keyUpEvent(event: any) { this.keyPress.emit(event.target.value) }

  toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
}