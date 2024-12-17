import {inject, Injectable, signal} from '@angular/core';

import {Place} from './place.model';
import {catchError, map, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ErrorService} from "../shared/error.service";

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private readonly httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Something went wrong fetching the available places. Please try again later.')
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places. Please try again later.')
      .pipe(tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces)
      }));
  }

  addPlaceToUserPlaces(place: Place) {
    const previousPlaces = this.userPlaces();
    if(!previousPlaces.some((p) => p.id === place.id )) {
      this.userPlaces.set([...previousPlaces, place])
    }
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id,
    }).pipe(
      catchError(error => {
        this.userPlaces.set(previousPlaces);
        this.errorService.showError('Failed to store ')
        return throwError(() => new Error('Failed to store selected place.'))
      })
    );
  }

  removeUserPlace(place: Place) {
    const previousPlaces = this.userPlaces()

    if(previousPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(previousPlaces.filter(p => p.id !== place.id));
    }
      return this.httpClient.delete('http://localhost:3000/user-places/' + place.id)
        .pipe(
        catchError(error => {
          this.userPlaces.set(previousPlaces);
          this.errorService.showError('Failed to remove the selected place ')
          return throwError(
            () => new Error('Failed to remove the selected place.'))
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url)
      .pipe(
        map((response) => response.places),
        catchError(() => {
          return throwError(
            () => new Error(errorMessage)
          );
        })
      )
  }
}
