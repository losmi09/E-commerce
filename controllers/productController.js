import { extname } from 'path';
import multer from 'multer';
import sharp from 'sharp';
import * as factory from './handlerFactory.js';
import { fileFilter } from './userController.js';
import catchAsync from '../utils/catchAsync.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
});

export const uploadProductImage = upload.single('image');

export const resizeProductImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const ext = extname(req.file.originalname);

  req.fileName = `product-${req.body.name}-${Date.now()}${ext}`;

  await sharp(req.file.buffer)
    .resize(1000, 1000)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.fileName}`);

  req.body.image = req.fileName;

  next();
});

export const getAllProducts = factory.getAll('product', 'price');
export const getProduct = factory.getOne('product');
export const createProduct = factory.createOne('product');
export const updateProduct = factory.updateOne('product');
export const deleteProduct = factory.deleteOne('product');
