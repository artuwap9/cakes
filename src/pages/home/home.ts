import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pasteles = [];
  pastel = {};

  constructor(public navCtrl: NavController, private databaseProvider: DatabaseProvider) {
    this.databaseProvider.getDatabaseState()
    .subscribe(rdy => {
      this.loadDeveloperData();
    })
  }
  loadDeveloperData() {
    this.databaseProvider.getAllPasteles()
    .then(data => {
      this.pasteles = data as any;
    });
  }

  addPasteles(){
    this.databaseProvider.addPasteles(this.pasteles["name"], parseInt(this.pasteles["price"]))
    .then(data => {
      this.loadDeveloperData();
    });
    this.pasteles = {} as any;
  }
}
