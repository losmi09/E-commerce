import multer from 'multer';
import fileFilter from '../utils/image/fileFilter.js';
import catchAsync from '../utils/catchAsync.js';
import * as crudController from './crudController.js';
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

export const getAllCategories = crudController.getAll('category');
export const getCategory = crudController.getOne('category');
export const createCategory = crudController.createOne('category');
export const updateCategory = crudController.updateOne('category');
export const deleteCategory = crudController.deleteOne('category');
