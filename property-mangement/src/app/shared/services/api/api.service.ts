import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { throwError, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { APP_CONFIG } from '@env/environment';
import * as CryptoJS from "crypto-js";


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public baseUrl: string = APP_CONFIG.APP_DOMAIN;

  public encryptedReq = APP_CONFIG.encryptedReq;
  
  constructor(private http: HttpClient) { }
  
  // POST API Method While Pass JSON Data

  postService(url: string, data?: any, params?:any): any {

    if(this.encryptedReq) {

      data = { "data" : this.encryptData(JSON.stringify(data)) };

      url = this.encryptData(url);

    }

    return this.http.post(this.baseUrl + url, data, { "params": params }).pipe(map((res) => res),catchError((err) => throwError(err)));

  }
  
  // PATCH API Method

  patchService(url: string, data?: any, params?:any): any {

    if(this.encryptedReq) {

      data = { "data" : this.encryptData(JSON.stringify(data)) };

      url = this.encryptData(url);

    }

    return this.http.patch(this.baseUrl + url, data, { "params" : params}).pipe(map((res) => res),catchError((err) => throwError(err)));

  }

  // PUT API Method

  putService(url: string, data?: any, params?:any): any {

    if(this.encryptedReq) {

      data = { "data" : this.encryptData(JSON.stringify(data)) };

      url = this.encryptData(url);

    }

    return this.http.put(this.baseUrl + url, data, { "params" : params}).pipe(map((res) => res),catchError((err) => throwError(err)));

  }

  // GET API Method  

  getService(url: string, params?: any): any {

    if(this.encryptedReq) url = this.encryptData(url);

    return this.http.get(this.baseUrl + url, {"params": params}).pipe(map((res) => res),catchError(err => throwError(err)));

  }

  // DELETE API Method

  deleteService(url: string,params?: any): any {

    if(this.encryptedReq)url = this.encryptData(url);

    return this.http.delete(this.baseUrl + url, { "params" : params}).pipe(map((res) => res),catchError((err) => throwError(err)));

  }

  // POST Method While Pass Form Data

  postFile(url: string, formData: any): any {

    if(this.encryptedReq) url = this.encryptData(url);

    return this.http.post(this.baseUrl + url, formData).pipe(map((res) => res),catchError((err) => throwError(err)));

  }

  // GET Method While Getting File

   getFile(url: string, params?: any): Observable<Blob> {

    if(this.encryptedReq) url = this.encryptData(url);

    return this.http.get(this.baseUrl + url, { params, responseType: "blob" }).pipe(map((res) => res),catchError((err) => throwError(err)));

  }

  // Encrypt the passing plain text using crypto js encryption

  encryptData(plainText: string): string {

    let encryptedData = CryptoJS.AES.encrypt(plainText, APP_CONFIG.secretKey).toString();

    return encryptedData;

  }
  
  // Decrypt the passing plain text using crypto js decryption

  decryptData(encryptedText: string): string {

    var decryptedData = CryptoJS.AES.decrypt(encryptedText, APP_CONFIG.secretKey).toString(CryptoJS.enc.Utf8);

    return decryptedData;

  }
  
}
