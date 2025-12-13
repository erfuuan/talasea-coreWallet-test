import mongoose from "mongoose";

class MongoService {
  constructor(models) {
    if (!models) {
      throw new Error("Models are required");
    }
    this.models = models;
  }

  async startSession() {
    try {
      return await mongoose.startSession();
    } catch (err) {
      console.error("Error from @startSession MongoService:", err);
      throw err;
    }
  }

  startTransaction(session) {
    try {
      if (!session) {
        throw new Error("Session is required to start transaction");
      }
      session.startTransaction();
      return session;
    } catch (err) {
      console.error("Error from @startTransaction MongoService:", err);
      throw err;
    }
  }

  async commitTransaction(session) {
    try {
      if (!session) {
        throw new Error("Session is required to commit transaction");
      }
      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      console.error("Error from @commitTransaction MongoService:", err);
      throw err;
    }
  }

  async abortTransaction(session) {
    try {
      if (!session) {
        throw new Error("Session is required to abort transaction");
      }
      await session.abortTransaction();
      session.endSession();
    } catch (err) {
      console.error("Error from @abortTransaction MongoService:", err);
      throw err;
    }
  }

  endSession(session) {
    try {
      if (session) {
        session.endSession();
      }
    } catch (err) {
      console.error("Error from @endSession MongoService:", err);
      throw err;
    }
  }

  async create(schema, data, session = null) {
    try {
      const Model = this.models[schema];
      if (!Model) {
        throw new Error(`Model '${schema}' not found`);
      }
      if (session) {
        const newData = await Model.create([data], { session });
        return newData[0];
      } else {
        const newData = new Model(data);
        return await newData.save();
      }
    } catch (err) {
      console.error(`Error from @create MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async findById(schema, dataId, populate = null, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.findOne({ _id: dataId });

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      const data = await query;

      if (data) {
        return data;
      } else {
        return undefined;
      }
    } catch (err) {
      console.error(`Error from @findById MongoService for schema ${schema}:`, err);
      return undefined;
    }
  }

  async findOneRecord(schema, condition, populate = null, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.findOne(condition);

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      const data = await query.lean();

      return data;
    } catch (err) {
      console.error(`Error from @findOneRecord MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async getAll(schema, condition = {}, populate = null, sort = null, select = null, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.find(condition);

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      if (sort) {
        query = query.sort(sort);
      }

      if (select) {
        query = query.select(select);
      }

      const posts = await query.lean();

      return posts;
    } catch (err) {
      console.error(`Error from @getAll MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async find(schema, condition = {}, populate = null, sort = null, select = null, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.find(condition);

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      if (sort) {
        query = query.sort(sort);
      }

      if (select) {
        query = query.select(select);
      }

      const data = await query.lean();

      return data;
    } catch (err) {
      console.error(`Error from @find MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async updateById(schema, data, dataId, populate = null, select = null, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.findByIdAndUpdate(dataId, data, { new: true });

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      if (select) {
        query = query.select(select);
      }

      const updatedData = await query.lean();

      return updatedData;
    } catch (err) {
      console.error(`Error from @updateById MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async delete(schema, dataId, data, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.findByIdAndUpdate(dataId, data);

      if (session) {
        query = query.session(session);
      }

      await query;
      return true;
    } catch (err) {
      console.error(`Error from @delete MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async deleteById(schema, dataId, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.findByIdAndDelete(dataId);

      if (session) {
        query = query.session(session);
      }

      const result = await query;
      return result !== null;
    } catch (err) {
      console.error(`Error from @deleteById MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async count(schema, condition = {}, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      let query = dataSchema.countDocuments(condition);

      if (session) {
        query = query.session(session);
      }

      return await query;
    } catch (err) {
      console.error(`Error from @count MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async updateOne(schema, condition, data, options = {}, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      const updateOptions = { new: true, ...options };
      if (session) {
        updateOptions.session = session;
      }

      const result = await dataSchema.updateOne(condition, data, updateOptions);
      return result;
    } catch (err) {
      console.error(`Error from @updateOne MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async updateMany(schema, condition, data, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      const options = session ? { session } : {};
      const result = await dataSchema.updateMany(condition, data, options);
      return result;
    } catch (err) {
      console.error(`Error from @updateMany MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async findOneAndUpdate(schema, condition, data, options = {}, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      const updateOptions = { new: true, ...options };
      if (session) {
        updateOptions.session = session;
      }

      const result = await dataSchema.findOneAndUpdate(condition, data, updateOptions);
      return result;
    } catch (err) {
      console.error(`Error from @findOneAndUpdate MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async findOneAndDelete(schema, condition, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      const options = session ? { session } : {};
      const result = await dataSchema.findOneAndDelete(condition, options);
      return result;
    } catch (err) {
      console.error(`Error from @findOneAndDelete MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async aggregate(schema, pipeline, session = null) {
    try {
      const dataSchema = this.models[schema];
      if (!dataSchema) {
        throw new Error(`Model '${schema}' not found`);
      }

      const options = session ? { session } : {};
      const result = await dataSchema.aggregate(pipeline, options);
      return result;
    } catch (err) {
      console.error(`Error from @aggregate MongoService for schema ${schema}:`, err);
      throw err;
    }
  }

  async save(document, session = null) {
    try {
      if (session) {
        return await document.save({ session });
      }
      return await document.save();
    } catch (err) {
      console.error("Error from @save MongoService:", err);
      throw err;
    }
  }
}

export default MongoService;
