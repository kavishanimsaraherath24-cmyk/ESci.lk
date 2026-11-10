import { z } from 'zod'

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  student_phone: z.string().min(9),
  parent_name: z.string().min(2),
  parent_phone: z.string().min(9),
  whatsapp: z.string().optional(),
  house_number: z.string().optional(),
  street: z.string().optional(),
  village_city: z.string().min(2),
  district: z.string().min(2),
  postal_code: z.string().optional(),
  school_name: z.string().min(2),
  current_grade: z.coerce.number().int().min(6).max(11),
  student_type: z.enum(['new', 'existing']),
  guardian_consent: z.literal('on'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const paymentSchema = z.object({
  class_id: z.string().uuid().optional(),
  payment_month: z.string(),
  amount: z.coerce.number().positive(),
  payment_date: z.string(),
  reference_no: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  subject: z.string().optional(),
  message: z.string().min(5),
})