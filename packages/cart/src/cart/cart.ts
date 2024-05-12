import { CartDiscount, CartItem, Condition, Freebie } from './cart.interface';

export class Cart {
  customerId: string;
  items: CartItem[];
  discounts: CartDiscount[];
  freebies: Freebie[];

  constructor(customerId: string) {
    this.customerId = customerId;
    this.items = [];
    this.discounts = [];
    this.freebies = [];
  }

  static create(customerId: string): Cart {
    return new Cart(customerId);
  }

  add(item: CartItem): void {
    const existingItem = this.items.find(i => i.product.id === item.product.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }

  update(item: CartItem): void {
    const existingItem = this.items.find(i => i.product.id === item.product.id);
    if (existingItem) {
      if (item.quantity <= 0) {
        this.remove(item.product.id);
        return;
      }
      existingItem.quantity = item.quantity;
    } else {
      this.items.push(item);
    }
  }

  remove(productId: string): void {
    this.items = this.items.filter(i => i.product.id !== productId);
  }

  destroy(): void {
    this.items = [];
  }

  has(productId: string): boolean {
    return this.items.some(i => i.product.id === productId);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  count(): CartItem[] {
    return this.items;
  }

  quantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  addDiscount(discount: CartDiscount): void {
    const existingDiscount = this.discounts.find(d => d.name === discount.name);
    if (existingDiscount) {
      existingDiscount.discount = discount.discount;
    } else {
      this.discounts.push(discount);
    }
  }

  removeDiscount(name: string): void {
    this.discounts = this.discounts.filter(d => d.name !== name);
  }

  total(): number {
    const total = this.items.reduce((total, item) => {
      return total + item.product.totalPrice(item.quantity);
    }, 0);

    return this.discounts.reduce((total, discount) => {
      if (discount.discount.type === 'fixed') {
        return total - discount.discount.amount;
      } else {
        const discountAmount = (total * discount.discount.amount) / 100;
        const maxDiscount = discount.discount.max;

        return maxDiscount
          ? total - Math.min(discountAmount, maxDiscount)
          : total - discountAmount;
      }
    }, total);
  }

  addFreebie(freebie: Freebie): void {
    this.freebies.push(freebie);
    if (this.checkFreebieEligibility(freebie.condition)) {
      this.add({
        product: freebie.reward.item,
        quantity: freebie.reward.quantity,
      });
    }
  }

  checkFreebieEligibility(condition: Condition): boolean {
    if (condition.type === 'contains') {
      return this.items.some(i => i.product.id === condition.item.id);
    }
    return false;
  }
}
