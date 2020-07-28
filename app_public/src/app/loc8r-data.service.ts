import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Location, Review } from './location'
import { environment } from '../environments/environment'
import { User } from './user';
import { AuthResponse } from './auth-response';
import { BROWSER_STORAGE } from "./storage";


@Injectable({
  providedIn: 'root'
})
export class Loc8rDataService {
  private apiBaseUrl = environment.apiBaseUrl;
  private apiBaseUrlGitHub = 'https://api.github.com';

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  public getLocations(lat: number, lng: number): Promise<Location[]> {
    const maxDistance: number = 30000;
    const url: string = `${this.apiBaseUrl}/locations?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => response as Location[])
      .catch(this.handleError);
  }
  public getLocationById(locationId: string): Promise<Location> {
    const maxDistance: number = 30000;
    const url: string = `${this.apiBaseUrl}/locations/${locationId}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => response as Location)
      .catch(this.handleError);
  }
  public addReviewByLocationId(locationId: string, formData: any): Promise<Review> {
    const url = `${this.apiBaseUrl}/locations/${locationId}/reviews`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('loc8r-token')}`
      })
    };
    return this.http
      .post(url, formData, httpOptions)
      .toPromise()
      .then(response => response as Review)
      .catch(this.handleError);
  }
  public getUser(): Promise<any> {
    const user: string = 'pauloebass';
    const url: string = `${this.apiBaseUrlGitHub}/users/${user}`;
    return this.http
      .get(url)
      .toPromise()
      .then(resp => resp as any)
      .catch(this.handleError)
  }
  public login(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('login', user);
  }
  public register(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('register', user);
  }
  private makeAuthApiCall(urlPath: string, user: User): Promise<AuthResponse> {
    const url = `${this.apiBaseUrl}/${urlPath}`;
    return this.http
      .post(url, user)
      .toPromise()
      .then(response => response as AuthResponse)
      .catch(err => this.handleError(err))
  }
  private handleError(error: any) {
    console.error("Something has gone worng", error);
    return Promise.reject(error.message || error);
  }
}
