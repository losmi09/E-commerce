import multer from 'multer';
import fileFilter from '../utils/image/fileFilter.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';
import * as imageService from '../services/imageService.js';

const storage = multer.memoryStorage();

const upload = multer({ storage, fileFilter });

export const uploadCategoryImage = upload.single('image');

export const resizeCategoryImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.body.image = await imageService.prepareTheImage({
    model: 'category',
    id: req.params.id,
    file: req.file,
  });

  next();
});

export const getAllCategories = factory.getAll('category');
export const getCategory = factory.getOne('category');
export const createCategory = factory.createOne('category');
export const updateCategory = factory.updateOne('category');
export const deleteCategory = factory.deleteOne('category');
