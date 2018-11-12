import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {
  exercises: Observable<ExerciseId[]>;
  private ExerciseCollection: AngularFirestoreCollection<Exercise>;

  constructor(private trainingService: TrainingService,
              private db: AngularFirestore) {
    this.ExerciseCollection = db.collection('availableExercises');
    this.exercises = this.ExerciseCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Exercise;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
}

  ngOnInit() {

  }


  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}

export interface ExerciseId extends Exercise {
  id: string;
}
