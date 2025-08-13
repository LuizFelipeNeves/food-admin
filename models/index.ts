import mongoose from "mongoose";

// =============================================================================
// CORE SCHEMAS (Store, User, UserStore)
// =============================================================================

/**
 * Store (Loja) - Schema principal para as lojas
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
 * User - Schema para usuários do sistema
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    favorites: [{ type: String }],
  },
  { timestamps: true }
);

/**
 * UserStore - Relacionamento many-to-many entre usuários e lojas
 */
const userStoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "employee"],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// =============================================================================
// PRODUCT SCHEMAS (Category, Item, Additional, AdditionalGroup)
// =============================================================================

/**
 * Category - Categorias de produtos
 */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
  description: { type: String, trim: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
});

/**
 * Additional - Adicionais para produtos
 */
const additionalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * AdditionalGroup - Grupos de adicionais
 */
const additionalGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
    description: { type: String, trim: true },
    additionals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Additional",
        required: true,
      },
    ],
    minQuantity: { type: Number, min: 0, default: 0 },
    maxQuantity: { type: Number, min: 0, default: 1 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Item - Produtos/Itens do cardápio
 */
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountPercentage: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
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

// =============================================================================
// PROMOTION SCHEMAS
// =============================================================================

/**
 * Promotion - Promoções e campanhas
 */
const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    rules: { type: String, required: true },
    image: { type: String, trim: true, default: null },
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

// =============================================================================
// ORDER SCHEMAS (Address, UserAddress, Order)
// =============================================================================

/**
 * Address - Schema reutilizável para endereços
 */
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  cep: { type: String, required: true },
  complement: { type: String, default: "" },
});

/**
 * UserAddress - Endereços salvos dos usuários
 */
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

/**
 * Order - Pedidos realizados
 */
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
    paymentStatus: { type: String, default: "pending" },
    change: { type: String },
    observation: { type: String },
    annotations: { type: String },
    source: { type: String, default: "app" },
    items: [
      {
        _id: { type: String, required: false },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        notes: { type: String },
        total: { type: Number },
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
    deliveryFee: { type: Number, required: true, default: 0 },
    subtotal: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, required: true },
    deliveryTime: { type: Number },
    events: [{
      date: { type: Date, required: true },
      status: { type: String, required: true },
      description: { type: String, required: true },
    }]
  },
  { timestamps: true }
);

// =============================================================================
// DEVICE SCHEMAS (Device, DeviceEvent)
// =============================================================================

/**
 * Device - Dispositivos WhatsApp conectados
 */
const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    deviceHash: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['active', 'registered', 'error', 'stopped'], 
      default: 'registered' 
    },
    isMain: { type: Boolean, default: false },
    autoStart: { type: Boolean, default: true },
    lastSeen: { type: Date, default: null },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * DeviceEvent - Histórico de eventos dos dispositivos
 */
const deviceEventSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    eventType: {
      type: String,
      enum: ['connected', 'disconnected', 'error', 'qr_generated', 'authenticated', 'ready', 'message_received', 'message_sent'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'registered', 'error', 'stopped'],
      required: true,
    },
    message: { type: String, trim: true },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// =============================================================================
// INDEXES
// =============================================================================

// Core indexes
storeSchema.index({ title: 1 });
userStoreSchema.index({ user: 1, store: 1 }, { unique: true });

// Product indexes
itemSchema.index({ store: 1, category: 1 });
additionalSchema.index({ store: 1 });
additionalGroupSchema.index({ store: 1 });

// Order indexes
userAddressSchema.index({ user: 1 });
orderSchema.index({ user: 1, status: 1 });

// Promotion indexes
promotionSchema.index({ store: 1, status: 1 });

// Device indexes
deviceSchema.index({ company: 1 });
deviceEventSchema.index({ device: 1, timestamp: -1 });
deviceEventSchema.index({ eventType: 1, timestamp: -1 });

// =============================================================================
// MODEL EXPORTS
// =============================================================================

// Core Models
export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const UserStore = mongoose.models.UserStore || mongoose.model('UserStore', userStoreSchema);

// Product Models
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export const Additional = mongoose.models.Additional || mongoose.model('Additional', additionalSchema);
export const AdditionalGroup = mongoose.models.AdditionalGroup || mongoose.model('AdditionalGroup', additionalGroupSchema);

// Promotion Models
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);

// Order Models
export const UserAddress = mongoose.models.UserAddress || mongoose.model('UserAddress', userAddressSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Device Models
export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export const DeviceEvent = mongoose.models.DeviceEvent || mongoose.model('DeviceEvent', deviceEventSchema);

// =============================================================================
// TYPE INTERFACES
// =============================================================================

export interface IOrder {
  paymentStatus: string;
  paymentMethod: string;
  observation: string;
  events: Array<{
      date: Date;
      description: string;
  }>;
}

export interface IDevice {
  _id: string;
  name: string;
  deviceHash: string;
  status: 'active' | 'registered' | 'error' | 'stopped';
  isMain?: boolean;
  autoStart: boolean;
  lastSeen?: Date | null;
  company: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IDeviceEvent {
  _id: string;
  device: string;
  eventType: 'connected' | 'disconnected' | 'error' | 'qr_generated' | 'authenticated' | 'ready' | 'message_received' | 'message_sent';
  status: 'active' | 'registered' | 'error' | 'stopped';
  message?: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}