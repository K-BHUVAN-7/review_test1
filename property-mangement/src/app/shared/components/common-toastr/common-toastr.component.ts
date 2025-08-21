import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'app-common-toastr',
  templateUrl: './common-toastr.component.html',
  standalone: false,
  styleUrls: ['./common-toastr.component.scss']
})
export class CommonToastrComponent implements OnInit {

  constructor(public sbRef: MatSnackBarRef<CommonToastrComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit(): void {
  }

   getIcon(): any{
    switch (this.data.type) {
      case 'success':
        return { parent: "success", child :'bi bi-check-circle fs-3', text: 'text-success' };
      case 'error':
        return { parent: "error", child :'bi bi-exclamation-circle fs-3',background: 'bg-danger bg-opacity-10 text-danger',text: 'text-danger' };
      case 'warn':
        return { parent: "warn", child :'bi bi-exclamation-triangle fs-3',background: 'bg-warning bg-opacity-10 text-warning',text: 'text-warning' };
      case 'info':
        return { parent: "info", child :'bi bi-info-circle fs-3',background: 'bg-info bg-opacity-10 text-info',text: 'text-info' };
    }
  }
}
