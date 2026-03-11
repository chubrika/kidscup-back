import { Category } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getCategories = async () => {
  const list = await Category.find().sort({ name: 1 }).lean();
  return list.map((doc) => ({
    id: String(doc._id),
    _id: String(doc._id),
    name: doc.name,
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
