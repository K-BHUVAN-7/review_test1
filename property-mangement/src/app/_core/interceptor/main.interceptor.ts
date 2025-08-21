import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpHeaders,
} from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { CommonService } from '@shared/services/common/common.service';
import { LoadingService } from '@shared/services/loading/loading.service';

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const MainInterceptor: HttpInterceptorFn = (request, next) => {

  let requests: HttpRequest<any>[] = [];
  const service = inject(CommonService);
  const _loading = inject(LoadingService);

  const token = service.session({ "method": 'get', "key": 'AuthToken' });

  const headers =  new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const AuthRequest = request.clone({ headers });
  
  return new Observable(observer => {

    const subscription = next(AuthRequest).subscribe((event: any): any => {

      if (event instanceof HttpResponse) {

        _loading.setLoading({ 'loading': false, 'url': request.url })

        observer.next(event);

      }

    }, (err: any) => {

      if (err.status == 401) {

        service.showToastr({ "data": { message: 'Sorry Session Expired 👋', type: 'error' } });

        service.logout();

      }

      _loading.setLoading({ 'loading': false, 'url': request.url })

      observer.error(err);
      
    }, () => {

      observer.complete();

    });

    return () => {

      subscription.unsubscribe();

    };

  });

};