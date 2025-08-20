import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private service: CommonService) { }

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if(this.service.session({ "method": "get", "key": "AuthToken"}) && this.service.session({ "method": "get", "key": "CompnayDetails"})   ) {

      this.service.navigate({ 'url': '/app/dashboard' });
    
      return false;

    }
      
    return true;

  }
  
}
