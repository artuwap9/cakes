import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from "@ionic-native/sqlite";
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from "@ionic/storage"
import { SQLitePorter } from '../../../node_modules/@ionic-native/sqlite-porter';
import { Platform } from 'ionic-angular';
//import { map } from '../../../node_modules/rxjs/operator/map';

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(
    public http: HttpClient, 
    private sqliteporter: SQLitePorter, 
    private storage: Storage,
    private sqlite: SQLite,
    private platform: Platform
  ) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "pasteles.db",
        location: "default"
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        this.storage.get("database_filled").then(val => {
          if (val) {
            this.databaseReady.next(true);
          } else {
            this.fillDatabase();
          }
        });
      });
    });
  }

  fillDatabase(){
    this.http.get("assets/pasteles.sql")
    //.map(res=>res.text())
    .subscribe(sql => {
      this.sqliteporter.importSqlToDb(this.database, sql as any)
      .then(data => {
        this.databaseReady.next(true);
        this.storage.set("database_filled", true);
      })
      .catch(e => console.log(e));
    });
  }

  addPasteles(name, price){
    let data = [name, price];
    return this.database.executeSql("INSERT TO pasteles (name, price) VALUES (?, ?, ?)", data)
    .then(res => {
      return res;
    });
  }

  getAllPasteles(){
    return this.database.executeSql("SELECT * from pasteles", [])
    .then(data => {
      let pasteles = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++){
          pasteles.push({
            name: data.rows.item(i).name,
            price: data.rows.item(i).price,
          });
        }
      }
      return pasteles;
    }, err => {
      console.log("Error: ", err);
    });
  }

  getDatabaseState(){
    return this.databaseReady.asObservable();
  }

}
