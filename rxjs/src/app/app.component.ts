import {Component, DestroyRef, effect, inject, OnInit, signal} from '@angular/core';
import {interval, map, Observable, reduce} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{
  private destroyRef = inject(DestroyRef);
  clickCount = signal(0);
  clickCount$ = toObservable(this.clickCount);
  interval$ = interval(1000);
  intervalSignal = toSignal(this.interval$, {initialValue: 0});
  customObservable$ = new Observable((subscriber) => {
    let timesExecuted = new Observable((subscriber) => {
      let timesExecuted = 0;
      const interval = setInterval(() => {
        if(timesExecuted > 3) {
          clearInterval(interval);
          subscriber.complete();
          return;
        }
        console.log('Emitting new value...')
        subscriber.error({message:'New value'});
      }, 2000);
    });
    })

  constructor() {
    /*effect(() => {
      console.log(`Clicked button ${this.clickCount()} times`);
    });*/
    this.customObservable$.subscribe({
      next: (value) => console.log(value)
    });
    const subscription = this.clickCount$.subscribe({
      next: (value) => {console.log(`Clicked button ${this.clickCount()} times`);}
    });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
  ngOnInit(): void {
    /*const subscription = interval(1000).pipe(
      map(value => value * 2)
    ).subscribe({
      next: value => {
        console.log(value);},
      complete: () => {}
    });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })*/
    this.clickCount$.subscribe({
      next: (value) => console.log(value),
      complete:() => console.log("COMPLETED!"),
      error:(err) => console.log(err),
    })
  }

  onClick() {
    this.clickCount.update(prevValue => prevValue + 1);
  }

}
