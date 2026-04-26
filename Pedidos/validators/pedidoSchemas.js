const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(99),
  note: z.string().trim().max(240).optional().default(''),
});

const createRoundSchema = z.object({
  tableId: z.string().trim().min(1).max(80),
  waiterId: z.string().trim().min(1).max(80).optional(),
  items: z.array(orderItemSchema).min(1).max(80),
});

const paymentSchema = z.object({
  sourceType: z.enum(['salon', 'delivery', 'takeaway']),
  sourceId: z.string().trim().min(1).max(80),
  documentType: z.enum(['boleta', 'factura', 'ticket']).default('boleta'),
  paymentMethod: z.enum(['efectivo', 'yape', 'plin', 'transferencia', 'tarjeta', 'codi', 'spei']),
  amount: z.number().positive().max(999999),
  customerDocument: z.string().trim().max(20).optional().default(''),
  businessName: z.string().trim().max(160).optional().default(''),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      });
    }

    req.validatedBody = result.data;
    return next();
  };
}

module.exports = {
  createRoundSchema,
  paymentSchema,
  validate,
};
