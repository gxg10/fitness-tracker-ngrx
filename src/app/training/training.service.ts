import {Subject, Observable } from 'rxjs';

import { Exercise } from "./exercise.model";
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import {Subscription} from 'rxjs';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) {}

  fetchAvailableExercises() {
    this.fbSubs.push(this.db.collection('availableExercises')
    .snapshotChanges().pipe(
    map(actions => actions.map(a => {
    const data = a.payload.doc.data() as Exercise;
    const id = a.payload.doc.id;
    return { id, ...data };
  }))
).subscribe(exercises => {
  this.store.dispatch(new UI.StopLoading());
  this.store.dispatch(new Training.SetAvailableTrainings(exercises));
},
error => {
    this.store.dispatch(new UI.StopLoading());
    // this.uiService.loadingStateChanged.next(false);
    this.uiService.showSnackbar('Fetching ex failed, please try again later',
    null, 3000);
    this.exercisesChanged.next(null);
}));
}

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining)
    .pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        date: new Date(),
        state: 'completed'
      });
      this.store.dispatch(new Training.StopTraining());
    });

  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining)
    .pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        duration: ex.duration * (progress / 100),
      calories: ex.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(
      this.db
        .collection('finishedExercises')
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          this.store.dispatch(new Training.SetFinishedTrainings(exercises));
        })
    );
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
