import { productStorage, customerStorage } from './storage';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Product validation functions
export const validateProductName = (name: string, excludeId?: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'El nombre del producto es obligatorio' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'El nombre del producto debe tener al menos 2 caracteres' };
  }

  // Check for duplicate names
  const existingProducts = productStorage.getAll();
  const isDuplicate = existingProducts.some(product => 
    product.name.toLowerCase().trim() === name.toLowerCase().trim() && 
    product.id !== excludeId
  );

  if (isDuplicate) {
    return { field: 'name', message: 'Ya existe un producto con este nombre. Por favor, elige un nombre diferente.' };
  }

  return null;
};

export const validateProductPrice = (price: number): ValidationError | null => {
  if (price === null || price === undefined || isNaN(price)) {
    return { field: 'price', message: 'El precio es obligatorio' };
  }

  if (price < 0) {
    return { field: 'price', message: 'El precio no puede ser negativo' };
  }

  if (price > 10000) {
    return { field: 'price', message: 'El precio no puede ser mayor a $10,000' };
  }

  // Check for more than 2 decimal places
  const decimalPlaces = (price.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { field: 'price', message: 'El precio no puede tener más de 2 decimales' };
  }

  return null;
};

export const validateProduct = (name: string, price: number, excludeId?: string): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateProductName(name, excludeId);
  if (nameError) errors.push(nameError);

  const priceError = validateProductPrice(price);
  if (priceError) errors.push(priceError);

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Customer validation functions
export const validateCustomerName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'El nombre del cliente es obligatorio' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'El nombre del cliente debe tener al menos 2 caracteres' };
  }

  return null;
};

export const validateCustomerEmail = (email: string, excludeId?: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'El email es obligatorio' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Por favor, ingresa un email válido' };
  }

  // Check for duplicate emails
  const existingCustomers = customerStorage.getAll();
  const isDuplicate = existingCustomers.some(customer => 
    customer.email.toLowerCase().trim() === email.toLowerCase().trim() && 
    customer.id !== excludeId
  );

  if (isDuplicate) {
    return { field: 'email', message: 'Ya existe un cliente con este email. Por favor, usa un email diferente.' };
  }

  return null;
};

export const validateCustomer = (name: string, email: string, excludeId?: string): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateCustomerName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateCustomerEmail(email, excludeId);
  if (emailError) errors.push(emailError);

  return {
    isValid: errors.length === 0,
    errors
  };
};
