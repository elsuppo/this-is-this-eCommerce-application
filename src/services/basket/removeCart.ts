import userStore from '../../store/user-store';
import createAnonymusCart from './createAnonymusCart';
import Notification from '../../components/notification/notification';
import getActiveCart from './getActiveCart';
import apiExistingToken from '../apiExistingToken';
import { Cart } from '@commercetools/platform-sdk';

export default async function removeCart(): Promise<void> {
  const { isAuth } = userStore.getState();
  let token: string | null;

  if (!isAuth) {
    token = localStorage.getItem('tokenAnon');

    if (!token) {
      await createAnonymusCart();
      token = localStorage.getItem('tokenAnon');

      if (!token) {
        new Notification('error', 'Something went wrong! Please try to log in or try again later.').showNotification();
        return;
      }
    }
  } else {
    token = localStorage.getItem('token');
    if (!token) {
      new Notification('error', 'Something went wrong! Please try to log in or try again later.').showNotification();
      return;
    }
  }

  const cart: Cart = await getActiveCart(token);

  await apiExistingToken(token)
    .me()
    .carts()
    .withId({
      ID: cart.id,
    })
    .delete({
      queryArgs: {
        version: cart.version,
      },
    })
    .execute();
}
