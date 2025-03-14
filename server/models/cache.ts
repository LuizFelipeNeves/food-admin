import mongoose, { Schema, Document } from 'mongoose';

export interface ICache extends Document {
  storeId: string;
  dataType: string;
  data: any;
  createdAt: Date;
  params?: Record<string, any>;
}

const CacheSchema = new Schema<ICache>(
  {
    storeId: { type: String, required: true },
    dataType: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    params: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: 1200 } // 20 minutos em segundos (TTL)
  },
  {
    timestamps: true,
  }
);

// Índice composto para buscar cache por storeId e dataType
CacheSchema.index({ storeId: 1, dataType: 1, params: 1 });

export const CacheModel = mongoose.models.Cache || mongoose.model<ICache>('Cache', CacheSchema); 