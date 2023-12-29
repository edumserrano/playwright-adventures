import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "accessibility-axe";

  onPressMeClick(event: Event) {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.ctrlKey) {
      alert("button pressed with ctrl key modifier");
    } else {
      alert("button pressed without ctrl key modifier");
    }
  }
}
