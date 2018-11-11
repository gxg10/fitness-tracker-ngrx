import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from './products.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fitness-tracker';
  productName = '';

  products = [];
  private productsSubscription: Subscription;

  constructor(private productsService: ProductsService) {
  }

  ngOnInit() {
    this.products = this.productsService.getProducts();
    this.productsSubscription = this.productsService.productsUpdated.subscribe(
      () => {
        this.products = this.productsService.getProducts();
      }
    );

  }

  onAddProduct(form) {
    // this.products.push(this.productName);.
    // console.log(form);
    this.productsService.addProduct(form.value.productName);
  }

  onRemoveProduct(productName: string) {
    this.products = this.products.filter(p => p !== productName);
  }

  ngOnDestroy() {
    this.productsSubscription.unsubscribe();
  }
}
