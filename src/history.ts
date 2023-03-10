import { createBrowserHistory } from 'history';

export enum ROUTES {
  ROOT = '/',
  PRODUCT = '/product/:id',
  CART = '/cart',
  CHECKOUT = '/checkout'

}

const history = createBrowserHistory({window});

const navigateTo = (route: string) => {
  history.push(route);
};

export { navigateTo, history };
