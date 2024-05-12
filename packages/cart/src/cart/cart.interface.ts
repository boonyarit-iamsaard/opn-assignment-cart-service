export interface BaseProduct {
  id: string;
  price: number;
  totalPrice: (quantity: number) => number;
}

export interface CartItem<T extends BaseProduct = BaseProduct> {
  product: T;
  quantity: number;
}

export interface Discount {
  type: 'fixed' | 'percentage';
  amount: number;
  max?: number;
}

export interface CartDiscount {
  name: string;
  discount: Discount;
}

export interface Condition<T extends BaseProduct = BaseProduct> {
  type: 'contains';
  item: T;
}

export interface Reward<T extends BaseProduct = BaseProduct> {
  item: T;
  quantity: number;
}

export interface Freebie {
  name: string;
  condition: Condition;
  reward: Reward;
}
