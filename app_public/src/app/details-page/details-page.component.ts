import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Loc8rDataService } from '../loc8r-data.service';
import { Location } from '../location';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {

  constructor(
    private loc8rDataService: Loc8rDataService,
    private route: ActivatedRoute
  ) { }

  public newLocation: Location
  public pageContent = {
    header: {
      title: 'Location name',
      strapline: ''
    },
    sidebar: `is on Loc8r because it has accessible wifi and space to
      sit down with your laptop and get some work done.
      If you\'ve been and you like it - or if you don\'t - please leave
       a review to help other people just like you.
    `
  };

  ngOnInit(): void {
    this.route.paramMap
    .pipe(
        switchMap((params: ParamMap) => {
          let id = params.get('locationId');
          return this.loc8rDataService.getLocationById(id);
        })
      )
      .subscribe((newLocation: Location) => {
        console.log(JSON.stringify(newLocation))
        this.newLocation = newLocation[0];
        this.pageContent.header.title = this.newLocation.name;
        this.pageContent.sidebar = `${this.newLocation.name} is on Mea99
          because it has accessible wifi and space to
          sit down with your laptop and get some work done.
          If you\'ve been and you like it - or if you don\'t - please leave
          a review to help other people just like you.`;
      });
  }

}
