const filterAndSort = (reqQuery, defaultSort) => {
  const { page = 1, limit = 100 } = reqQuery;

  const skip = (+page - 1) * +limit;

  const excludeFromQuery = ['page', 'limit', 'sort'];

  const query = structuredClone(reqQuery);

  if (!query.sort) query.sort = defaultSort;

  const sortingBy = query.sort.split(',');

  const sorting = Array.from({ length: sortingBy.length }, () => {
    return {};
  });

  query.sort.split(',').forEach((el, i) => {
    if (el.includes('-')) sorting[i][el.slice(1)] = 'desc';
    else sorting[i][el] = 'asc';
  });

  Object.entries(query).forEach(entry => {
    const [key, value] = entry;
    if (Number.isFinite(+value)) query[key] = +value;
  });

  excludeFromQuery.forEach(el => delete query[el]);

  return { skip, limit, query, sorting };
};

export default filterAndSort;
