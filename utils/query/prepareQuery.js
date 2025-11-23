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

  // By default every value in req.query is string, so convert "100" to 100 as an example
  convertQueryValuesToNumbers(query);

  return { skip, limit, orderBy };
};

export default prepareQuery;
