import prisma from '../server.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import productSchema from '../schemas-validation/productSchema.js';
import filterAndSort from '../utils/filtering-sorting.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  try {
    const { skip, limit, query, sorting } = filterAndSort(req.query, 'price');

    const products = await prisma.product.findMany({
      skip,
      take: +limit,
      where: {
        ...query,
      },
      orderBy: sorting,
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    if (err.message.includes('Unknown argument'))
      return next(new AppError('Bad filter', 400));
  }
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: {
      id: +req.params.id,
    },
  });

  if (!product) return next(new AppError('No product found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  const { error, value } = productSchema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message.replaceAll('"', '');
    return next(new AppError(errorMessage, 400));
  }

  const { name, description, price } = value;

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      price,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { error, value } = productSchema.validate(req.body);

  const errorMessage = error.details[0].message;

  if (error && !errorMessage.endsWith('required'))
    return next(new AppError(errorMessage, 400));

  const updatedProduct = await prisma.product.update({
    where: {
      id: +req.params.id,
    },
    data: {
      ...value,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  await prisma.product.delete({
    where: {
      id: +req.params.id,
    },
  });

  res.status(204).end();
});
