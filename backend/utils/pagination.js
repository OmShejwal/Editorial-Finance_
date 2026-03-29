const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await model.countDocuments(query);
  const data = await model.find(query)
    .sort(options.sort || '-createdAt')
    .skip(skip)
    .limit(limit)
    .populate(options.populate || '');

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  paginate
};
