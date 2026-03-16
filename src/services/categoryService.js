import { Category } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getCategories = async () => {
  const list = await Category.find().sort({ name: 1 }).lean();
  return list.map((doc) => ({
    id: String(doc._id),
    _id: String(doc._id),
    name: doc.name,
    minAge: doc.minAge,
    maxAge: doc.maxAge,
    description: doc.description,
  }));
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found.', 404);
  return category;
};

export const createCategory = async (data) => {
  return Category.create(data);
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found.', 404);
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError('Category not found.', 404);
};

