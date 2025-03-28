import { CacheModel } from '../models/cache';

export interface CacheOptions {
  storeId: string;
  dataType: string;
  params?: Record<string, any>;
}

export class CacheService {
  /**
   * Obtém dados do cache
   * @param options Opções de cache
   * @returns Dados do cache ou null se não encontrado
   */
  static async getCache<T>(options: CacheOptions): Promise<{ data: T; timestamp: Date } | null> {
    try {
      const cache = await CacheModel.findOne({
        storeId: options.storeId,
        dataType: options.dataType,
        ...(options.params ? { params: options.params } : {})
      }).lean();

      if (!cache) {
        return null;
      }

      if (!cache || typeof cache !== 'object' || !('data' in cache)) {
        return null;
      }

      return {
        data: cache.data as T,
        timestamp: cache.createdAt
      };
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  /**
   * Salva dados no cache
   * @param options Opções de cache
   * @param data Dados a serem salvos
   * @returns Resultado da operação
   */
  static async setCache<T>(options: CacheOptions, data: T): Promise<boolean> {
    try {
      await CacheModel.findOneAndUpdate(
        {
          storeId: options.storeId,
          dataType: options.dataType,
          ...(options.params ? { params: options.params } : {})
        },
        {
          $set: {
            data,
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          new: true
        }
      );

      return true;
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
      return false;
    }
  }

  /**
   * Limpa o cache para um determinado tipo de dados
   * @param options Opções de cache
   * @returns Resultado da operação
   */
  static async clearCache(options: CacheOptions): Promise<boolean> {
    try {
      await CacheModel.deleteMany({
        storeId: options.storeId,
        dataType: options.dataType,
        ...(options.params ? { params: options.params } : {})
      });

      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Limpa o cache usando um padrão de dataType
   * @param options Opções parciais de cache (apenas storeId obrigatório)
   * @param pattern Padrão para matching de dataType (ex: 'dashboard.*')
   * @returns Resultado da operação
   */
  static async clearCacheByPattern(storeId: string, pattern: string): Promise<boolean> {
    try {
      const regex = new RegExp(pattern.replace('.', '\\.').replace('*', '.*'));
      await CacheModel.deleteMany({
        storeId,
        dataType: { $regex: regex }
      });

      return true;
    } catch (error) {
      console.error('Erro ao limpar cache por padrão:', error);
      return false;
    }
  }
} 