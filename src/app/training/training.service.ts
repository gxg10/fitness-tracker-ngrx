import {Subject, Observable } from 'rxjs';

import { Exercise } from "./exercise.model";
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import {Subscription} from 'rxjs';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {

    // exercises: Observable<ExerciseId[]>;
    // private ExerciseCollection: AngularFirestoreCollection<Exercise>;
    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    availableExercises: Exercise[] = [];

    private runningExercise: Exercise;
    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore,
                private uiService: UIService) {}

    fetchAvailableExercises() {
        this.fbSubs.push(this.db.collection('availableExercises')
        .snapshotChanges().pipe(
        map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Exercise;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(exercises => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
    },
    error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar('Fetching ex failed, please try again later',
        null, 3000);
        this.exercisesChanged.next(null);
    }));
    }

    startExercise(selectedId: string) {
        // this.db.doc('availableExercises/' + selectedId).update({
        //     lastSelected: new Date()
        // });
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise});
    }

    completeExercise() {
        this.addDataToDatabase({...this.runningExercise, date: new Date(), state: 'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            date: new Date(),
            state: 'cancelled'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelled() {
        this.fbSubs.push(this.db.collection('finishedExercises').valueChanges()
        .subscribe((exercises: Exercise[]) => {
            this.finishedExercisesChanged.next(exercises);
        }));
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}

