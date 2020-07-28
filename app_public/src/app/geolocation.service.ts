import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  public getPosition(bcSuccess, cbError, cbNoGeo): void{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(bcSuccess,cbError);
    }else{
      cbNoGeo();
    }
  }
}
