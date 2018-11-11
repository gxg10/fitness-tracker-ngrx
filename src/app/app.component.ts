import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fitness-tracker';
  productName = 'A Book';

  products = ['A boot', 'A tree'];

  onAddProduct() {
    this.products.push(this.productName);
  }
}
