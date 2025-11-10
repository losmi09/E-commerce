import multer from 'multer';
import sharp from 'sharp';
import prettyBytes from 'pretty-bytes';
import * as factory from './handlerFactory.js';
import { fileFilter } from './userController.js';
import catchAsync from '../utils/catchAsync.js';
import prisma from '../server.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
});

export const uploadProductImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTheImage = async (buffer, path, fileName) =>
  await sharp(buffer)
    .resize(2000, 1333)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${path}/${fileName}`);

export const resizeProductImage = catchAsync(async (req, res, next) => {
  if (!req.files?.coverImage?.[0] || !req.files.images?.[0]) return next();

  const coverImage = `product-${req.params.id}-${Date.now()}-cover.jpg`;

  req.body.coverImage = coverImage;

  await resizeTheImage(req.files.coverImage[0].buffer, 'products', coverImage);

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `product-${req.params.id}-${Date.now()}-${i + 1}.jpg`;

      await prisma.productImage.create({
        data: {
          productId: +req.params.id,
          fileName,
          extension: 'jpg',
          size: file.size,
          humanReadableSize: prettyBytes(file.size),
        },
      });

      await resizeTheImage(file.buffer, 'products', fileName);
    })
  );

  next();
});

export const getAllProducts = factory.getAll('product', 'price');
export const getProduct = factory.getOne('product');
export const createProduct = factory.createOne('product');
export const updateProduct = factory.updateOne('product');
export const deleteProduct = factory.deleteOne('product');
