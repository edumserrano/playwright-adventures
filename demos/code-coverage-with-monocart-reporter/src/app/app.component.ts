import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'code-coverage-with-monocart-reporter';

  onPressMeClick(event: Event) {
    const pointerEvent = event as PointerEvent;
    if (pointerEvent.ctrlKey) {
      alert("button pressed with ctrl key modifier");
    } else {
      alert("button pressed without ctrl key modifier");
    }
  }
}
