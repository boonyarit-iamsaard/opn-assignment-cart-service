import { BaseProduct, Cart } from '../cart';
import { beforeEach, describe, expect, test } from 'vitest';

interface MockProduct extends BaseProduct {
  name: string;
}

describe('cart service', () => {
  let cart: Cart;

  const productA: MockProduct = {
    id: 'productA',
    name: 'Product A',
    price: 100,
    totalPrice: quantity => quantity * 100,
  };

  const productB: MockProduct = {
    id: 'productB',
    name: 'Product B',
    price: 200,
    totalPrice: quantity => quantity * 200,
  };

  beforeEach(() => {
    cart = new Cart('customerA');
  });

  describe('create', () => {
    test('should create a new cart', () => {
      expect(cart).toBeInstanceOf(Cart);
    });
  });

  describe('add', () => {
    test('should add items to the cart', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 2,
        },
        {
          product: productB,
          quantity: 1,
        },
      ]);
    });

    test('should update quantity when adding existing product', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productA, quantity: 3 });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 5,
        },
      ]);
    });
  });

  describe('update', () => {
    test('should update quantity when updating existing product', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.update({ product: productA, quantity: 3 });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 3,
        },
      ]);
    });

    test('should remove product from cart when quantity is 0', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.update({ product: productA, quantity: 0 });
      expect(cart.count()).toEqual([]);
    });

    test('should add item when updating non-existing product', () => {
      cart.update({ product: productA, quantity: 3 });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 3,
        },
      ]);
    });
  });

  describe('remove', () => {
    test('should remove product from cart', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      cart.remove(productA.id);
      expect(cart.count()).toEqual([
        {
          product: productB,
          quantity: 1,
        },
      ]);
    });
  });

  describe('destroy', () => {
    test('should empty the cart', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      cart.destroy();
      expect(cart.count()).toEqual([]);
    });
  });

  describe('has', () => {
    test('should check if product is in the cart', () => {
      expect(cart.has(productA.id)).toBe(false);
      cart.add({ product: productA, quantity: 2 });
      expect(cart.has(productA.id)).toBe(true);
    });
  });

  describe('isEmpty', () => {
    test('should check if cart is empty', () => {
      expect(cart.isEmpty()).toBe(true);
      cart.add({ product: productA, quantity: 2 });
      expect(cart.isEmpty()).toBe(false);
    });
  });

  describe('count', () => {
    test('should return the items in the cart', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 2,
        },
        {
          product: productB,
          quantity: 1,
        },
      ]);
    });
  });

  describe('quantity', () => {
    test('should return the total quantity of items in the cart', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      expect(cart.quantity()).toBe(3);
    });
  });

  describe('addDiscount', () => {
    test('should add discount to the cart', () => {
      cart.addDiscount({
        name: 'discountA',
        discount: { type: 'fixed', amount: 10 },
      });
      expect(cart.discounts).toEqual([
        {
          name: 'discountA',
          discount: { type: 'fixed', amount: 10 },
        },
      ]);
    });
  });

  describe('removeDiscount', () => {
    test('should remove discount from the cart', () => {
      cart.addDiscount({
        name: 'discountA',
        discount: { type: 'fixed', amount: 10 },
      });
      cart.removeDiscount('discountA');
      expect(cart.discounts).toEqual([]);
    });
  });

  describe('total', () => {
    test('should return the total price of items in the cart without discount', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      expect(cart.total()).toBe(400);
    });

    test('should return the total price of items in the cart with discount type fixed', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      cart.addDiscount({
        name: 'discountA',
        discount: { type: 'fixed', amount: 10 },
      });
      expect(cart.total()).toBe(390);
    });

    test('should return the total price of items in the cart with discount type percentage and max amount is not defined', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      cart.addDiscount({
        name: 'discountA',
        discount: { type: 'percentage', amount: 10 },
      });
      expect(cart.total()).toBe(360);
    });

    test('should return the total price of items in the cart with discount type percentage and max amount is defined', () => {
      cart.add({ product: productA, quantity: 2 });
      cart.add({ product: productB, quantity: 1 });
      cart.addDiscount({
        name: 'discountA',
        discount: { type: 'percentage', amount: 10, max: 20 },
      });
      expect(cart.total()).toBe(380);
    });
  });

  describe('addFreebie', () => {
    test('should add freebie to the cart', () => {
      cart.addFreebie({
        name: 'freebieA',
        condition: { type: 'contains', item: productA },
        reward: { item: productB, quantity: 1 },
      });
      expect(cart.freebies).toEqual([
        {
          name: 'freebieA',
          condition: { type: 'contains', item: productA },
          reward: { item: productB, quantity: 1 },
        },
      ]);
    });

    test('should add freebie item to the cart when freebie condition is met', () => {
      cart.add({ product: productA, quantity: 1 });
      cart.addFreebie({
        name: 'freebieA',
        condition: { type: 'contains', item: productA },
        reward: { item: productB, quantity: 1 },
      });
      expect(cart.count()).toEqual([
        {
          product: productA,
          quantity: 1,
        },
        {
          product: productB,
          quantity: 1,
        },
      ]);
    });

    test('should not add freebie item to the cart when freebie condition is not met', () => {
      cart.addFreebie({
        name: 'freebieA',
        condition: { type: 'contains', item: productA },
        reward: { item: productB, quantity: 1 },
      });
      expect(cart.count()).toEqual([]);
    });
  });

  describe('checkFreebieEligibility', () => {
    test('should return true when freebie condition is met', () => {
      cart.add({ product: productA, quantity: 1 });
      expect(
        cart.checkFreebieEligibility({ type: 'contains', item: productA })
      ).toBe(true);
    });

    test('should return false when freebie condition is not met', () => {
      expect(
        cart.checkFreebieEligibility({ type: 'contains', item: productA })
      ).toBe(false);
    });
  });
});
