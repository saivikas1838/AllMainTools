import { Component } from '@angular/core';
import { NavigationBarComponent } from "../navbar/navigation-bar/navigation-bar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [NavigationBarComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
