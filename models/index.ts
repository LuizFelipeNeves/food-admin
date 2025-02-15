import mongoose from "mongoose";

/**
 * Store (Loja)
 */
const storeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    showPublicEmail: { type: Boolean, default: false },
    showPublicPhone: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: false },
    soundAlerts: { type: Boolean, default: false },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    businessHours: [
      {
        day: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        hours: {
          from: {
            hour: { type: Number, required: true, min: 0, max: 23 },
            minute: { type: Number, required: true, min: 0, max: 59 },
          },
          to: {
            hour: { type: Number, required: true, min: 0, max: 23 },
            minute: { type: Number, required: true, min: 0, max: 59 },
          },
        },
      },
    ],
    paymentMethods: [{ type: String }],
    minOrderValue: { type: Number, default: 0, min: 0 },
    showFreeShippingBanner: { type: Boolean, default: false },
    address: {
      street: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      cep: { type: String, required: true },
      complement: { type: String, default: "" },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

/**
 * Category (Categoria)
 */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
});

/**
 * Item (Produto)
 */
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountPercentage: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    additionals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Additional",
        required: true,
      },
    ],
    additionalGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdditionalGroup",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    rules: { type: String, required: true },
    image: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discountPercentage: { type: Number, required: true },
    minimumValue: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    currentUsage: { type: Number, default: 0 },
    items: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

const additionalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

const additionalGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    active: { type: Boolean, required: true },
    description: { type: String, trim: true },
    additionals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Additional",
        required: true,
      },
    ],
    minQuantity: { type: Number, required: true, min: 0, default: 0 },
    maxQuantity: { type: Number, required: true, min: 0, default: 1 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    favorites: [{ type: String }],
  },
  { timestamps: true }
);

const userAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    street: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    cep: { type: String, required: true },
    complement: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userAddressSchema.index({ user: 1 });

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  cep: { type: String, required: true },
  complement: { type: String, default: "" },
})

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryType: { type: String, required: true },
    address: {
      type: addressSchema,
      required: false
    },
    paymentMethod: { type: String, required: true },
    change: { type: String },
    observation: { type: String },
    items: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        notes: { type: String },
        additionals: [
          {
            _id: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
          },
        ],
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    total: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexação para otimização de buscas
storeSchema.index({ title: 1 });
itemSchema.index({ store: 1, category: 1 });
promotionSchema.index({ store: 1, status: 1 });
additionalSchema.index({ store: 1 });
additionalGroupSchema.index({ store: 1 });
orderSchema.index({ user: 1, status: 1 });

// Model exports
export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export const Additional = mongoose.models.Additional || mongoose.model('Additional', additionalSchema);
export const AdditionalGroup = mongoose.models.AdditionalGroup || mongoose.model('AdditionalGroup', additionalGroupSchema);
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const UserAddress = mongoose.models.UserAddress || mongoose.model('UserAddress', userAddressSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
