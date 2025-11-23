const paginate = query => {
  const { page = 1, limit = 100 } = query;

  const skip = (+page - 1) * +limit;

  return { skip, limit };
};

export default paginate;
