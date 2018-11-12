import {Subject, Observable } from 'rxjs';

import { Exercise } from "./exercise.model";
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable()
export class TrainingService {

    // exercises: Observable<ExerciseId[]>;
    // private ExerciseCollection: AngularFirestoreCollection<Exercise>;
    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();

    availableExercises: Exercise[] = [];

    private runningExercise: Exercise;
    private exercises: Exercise[] = [];

    constructor(private db: AngularFirestore) {}

    fetchAvailableExercises() {
        this.db.collection('availableExercises')
        .snapshotChanges().pipe(
        map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Exercise;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(exercises => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
    });
    }

    startExercise(selectedId: string) {
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise});
    }

    completeExercise() {
        this.exercises.push({...this.runningExercise, date: new Date(), state: 'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.exercises.push({
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

    getCompletedOrCancelled() {
        return this.exercises.slice();
    }
}

export interface ExerciseId extends Exercise {
    id: string;
  }
  
