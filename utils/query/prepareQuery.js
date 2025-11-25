import paginate from './paginate.js';
import sort from './sort.js';

const convertQueryValuesToNumbers = query =>
  Object.entries(query).forEach(entry => {
    const [key, value] = entry;
    if (Number.isFinite(+value)) query[key] = +value;
  });

const prepareQuery = (query, model) => {
  // cartItems table has compound index of (cartId and productId), so no id as primary key
  const defaultSort = model === 'cartItem' ? 'productId' : 'id';

  const { skip, limit } = paginate(query);

  const { orderBy } = sort(query, defaultSort);

  // Convert numeric strings to numbers in req.query
  convertQueryValuesToNumbers(query);

  return { skip, limit, orderBy };
};

export default prepareQuery;
