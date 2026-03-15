import { Component } from '@angular/core';
import { NavigationBarComponent } from "../navbar/navigation-bar/navigation-bar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-toolscomponent',
  imports: [NavigationBarComponent, RouterModule],
  templateUrl: './toolscomponent.component.html',
  styleUrl: './toolscomponent.component.scss'
})
export class ToolscomponentComponent {

}
