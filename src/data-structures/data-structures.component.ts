import { Component } from '@angular/core';
import { NavigationBarComponent } from "../navbar/navigation-bar/navigation-bar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-data-structures',
  imports: [NavigationBarComponent, RouterModule],
  templateUrl: './data-structures.component.html',
  styleUrl: './data-structures.component.scss'
})
export class DataStructuresComponent {

}
