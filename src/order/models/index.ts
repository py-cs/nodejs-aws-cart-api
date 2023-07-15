import { CartItem } from '../../cart/models';

export type Order = {
  id?: string;
  userId: string;
  cartId: string;
  items: CartItem[];
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };
  delivery: {
    address: string;
    firstName: string;
    lastName: string;
    comment?: string;
  };
  comments: string;
  status: string;
  total: number;
};
