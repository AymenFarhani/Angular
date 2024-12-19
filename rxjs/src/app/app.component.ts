import {Component, computed, DestroyRef, effect, inject, OnInit, signal} from '@angular/core';
import {filter, interval, map, Observable} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  clickCount = signal(0)
  interval = signal(15)
  private readonly destroyRef = inject(DestroyRef)
  observableValue$ = toObservable(this.interval)
  newSignal = toSignal(this.observableValue$)
  customObservable$ = new Observable((subscriber) => {
    let timeExecuted = 0;
    const interval = setInterval(( )=> {
      if(timeExecuted > 1 ) {
        clearInterval(interval)
        subscriber.complete()
        return;
      }
      console.log('Emitting new value ...')
      subscriber.next({message: 'New Value'})
      timeExecuted++
    }, 2000)
  })
  constructor() {
    effect(() => {
      console.log(`Clicked button ${this.clickCount()} times.`)
    });
  }

  ngOnInit(): void {
    this.customObservable$.subscribe({
      next: (value) => console.log(value),
      complete: () => console.log('COMPLETED')
    });
    setInterval(() => {
      //update some signal
      this.interval.update(previousValue => previousValue++)
    }, 1000)
    this.observableValue$.subscribe(value => {
      console.log(value)
    })

    /*const subscription = interval(1000).pipe(
      filter((value) => value < 20),
      map(value => value * 2),
      filter(value => value % 3 === 0)
    ).subscribe({
      next: (data) => console.log(data)
    })
    this.destroyRef.onDestroy(() => subscription.unsubscribe())*/
  }

  onClick() {
    this.clickCount.update( value => value + 1)
    console.log(this.newSignal())
  }
}
