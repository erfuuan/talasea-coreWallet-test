import mongoose from "mongoose";
import logger from "../utils/Logger.js";

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
      logger.error("Error from @startSession MongoService", err);
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
      logger.error("Error from @startTransaction MongoService", err);
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
      logger.error("Error from @commitTransaction MongoService", err);
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
      logger.error("Error from @abortTransaction MongoService", err);
      throw err;
    }
  }

  endSession(session) {
    try {
      if (session) {
        session.endSession();
      }
    } catch (err) {
      logger.error("Error from @endSession MongoService", err);
      throw err;
    }
  }

  async create(Model, data, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.create !== "function") {
        throw new Error("Valid Mongoose Model is required for create");
      }

      if (session) {
        const docs = await Model.create([data], { session });
        return docs[0];
      }

      const doc = new Model(data);
      return await doc.save();
    } catch (err) {
      logger.error(
        `Error in MongoService.create for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, data }
      );
      throw err;
    }
  }

  async findById(Model, id, options = {}) {
    const { populate = null, session = null } = options;

    try {
      if (!Model || typeof Model.findById !== "function") {
        throw new Error("Valid Mongoose Model is required for findById");
      }

      let query = Model.findById(id);

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      const result = await query.lean();
      return result ?? undefined;
    } catch (err) {
      logger.error(
        `Error in MongoService.findById for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, id }
      );
      return undefined;
    }
  }

  async findOneRecord(Model, condition, options = {}) {
    const { populate = null, session = null } = options;

    try {
      // 1) Validate Model
      if (!Model || typeof Model.findOne !== "function") {
        throw new Error("Valid Mongoose Model is required");
      }

      // 2) Build query
      let query = Model.findOne(condition);

      if (session) {
        query = query.session(session);
      }
      if (populate) {
        query = query.populate(populate);
      }

      // 3) Execute and return lean result
      const result = await query.lean();
      return result;
    } catch (err) {
      logger.error(
        `Error in MongoService.findOneRecord for model ${Model.modelName || "unknown"}`,
        err,
        { model: Model.modelName, condition, populate }
      );
      throw err;
    }
  }

  async getAll(Model, condition = {}, options = {}) {
    const {
      populate = null,
      sort = null,
      select = null,
      session = null,
    } = options;

    try {
      if (!Model || typeof Model.find !== "function") {
        throw new Error("Valid Mongoose Model is required for getAll");
      }

      let query = Model.find(condition);

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

      const docs = await query.lean();
      return docs;
    } catch (err) {
      logger.error(
        `Error in MongoService.getAll for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition, options }
      );
      throw err;
    }
  }

  async find(Model, condition = {}, options = {}) {
    const {
      populate = null,
      sort = null,
      select = null,
      session = null,
    } = options;

    try {
      if (!Model || typeof Model.find !== "function") {
        throw new Error("Valid Mongoose Model is required for find");
      }

      let query = Model.find(condition);

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
      logger.error(
        `Error in MongoService.find for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition, options }
      );
      throw err;
    }
  }

  async updateById(Model, data, id, options = {}) {
    const {
      populate = null,
      select = null,
      session = null,
    } = options;

    try {
      if (!Model || typeof Model.findOneAndUpdate !== "function") {
        throw new Error("Valid Mongoose Model is required for updateById");
      }

      let query = Model.findOneAndUpdate(
        { _id: id },
        data,
        { new: true } // این گزینه باعث میشه مقدار *بروزرسانی‌شده* برگرده :contentReference[oaicite:0]{index=0}
      );

      if (session) {
        query = query.session(session);
      }

      if (populate) {
        query = query.populate(populate);
      }

      if (select) {
        query = query.select(select);
      }

      const updated = await query.lean();
      return updated;
    } catch (err) {
      logger.error(
        `Error in MongoService.updateById for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, id, data }
      );
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
      logger.error(`Error from @delete MongoService for schema ${schema}`, err, { schema, dataId });
      throw err;
    }
  }

  async deleteById(Model, id, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.findByIdAndDelete !== "function") {
        throw new Error("Valid Mongoose Model is required for deleteById");
      }

      let query = Model.findByIdAndDelete(id);

      if (session) {
        query = query.session(session);
      }

      const deletedDoc = await query.lean();
      return deletedDoc ?? null;
    } catch (err) {
      logger.error(
        `Error in MongoService.deleteById for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, id }
      );
      throw err;
    }
  }


  async count(Model, condition = {}, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.countDocuments !== "function") {
        throw new Error("Valid Mongoose Model is required for count");
      }

      let query = Model.countDocuments(condition);

      if (session) {
        query = query.session(session);
      }

      const total = await query;
      return total;
    } catch (err) {
      logger.error(
        `Error in MongoService.count for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition }
      );
      throw err;
    }
  }

  async updateOne(Model, condition, data, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.updateOne !== "function") {
        throw new Error("Valid Mongoose Model is required for updateOne");
      }

      const updateOptions = { ...options };
      if (session) {
        updateOptions.session = session;
      }

      const result = await Model.updateOne(condition, data, updateOptions);
      return result;
    } catch (err) {
      logger.error(
        `Error in MongoService.updateOne for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition, data }
      );
      throw err;
    }
  }


  async updateMany(Model, condition, data, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.updateMany !== "function") {
        throw new Error("Valid Mongoose Model is required for updateMany");
      }

      const updateOptions = {};
      if (session) {
        updateOptions.session = session;
      }

      const result = await Model.updateMany(condition, data, updateOptions);
      return result;
    } catch (err) {
      logger.error(
        `Error in MongoService.updateMany for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition, data }
      );
      throw err;
    }
  }


  async findOneAndUpdate(Model, condition, data, options = {}) {
    const {
      session = null,
      populate = null,
      select = null,
      upsert = false,
      lean = true
    } = options;

    try {
      if (!Model || typeof Model.findOneAndUpdate !== "function") {
        throw new Error("Valid Mongoose Model is required for findOneAndUpdate");
      }

      // default: return updated document
      const updateOptions = { new: true, upsert, ...options };

      if (session) {
        updateOptions.session = session;
      }

      let query = Model.findOneAndUpdate(condition, data, updateOptions);

      if (populate) {
        query = query.populate(populate);
      }

      if (select) {
        query = query.select(select);
      }

      if (lean) {
        query = query.lean();
      }

      const updatedDoc = await query;
      return updatedDoc;
    } catch (err) {
      logger.error(
        `Error in MongoService.findOneAndUpdate for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition, data }
      );
      throw err;
    }
  }


  async findOneAndDelete(Model, condition, options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.findOneAndDelete !== "function") {
        throw new Error("Valid Mongoose Model is required for findOneAndDelete");
      }

      let query = Model.findOneAndDelete(condition);

      if (session) {
        query = query.session(session);
      }

      const deletedDoc = await query.lean();
      return deletedDoc;
    } catch (err) {
      logger.error(
        `Error in MongoService.findOneAndDelete for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, condition }
      );
      throw err;
    }
  }



  async aggregate(Model, pipeline = [], options = {}) {
    const { session = null } = options;

    try {
      if (!Model || typeof Model.aggregate !== "function") {
        throw new Error("Valid Mongoose Model is required for aggregate");
      }

      // Build aggregation
      const agg = Model.aggregate(pipeline);

      // If a session is provided, attach it
      if (session) {
        agg.options = agg.options || {};
        agg.options.session = session;
      }

      const result = await agg.exec();
      return result;
    } catch (err) {
      logger.error(
        `Error in MongoService.aggregate for model ${Model?.modelName || "unknown"}`,
        err,
        { model: Model?.modelName, pipeline }
      );
      throw err;
    }
  }



  async save(document, options = {}) {
    const { session = null } = options;

    try {
      if (!document || typeof document.save !== "function") {
        throw new Error("Valid Mongoose document is required for save");
      }

      if (session) {
        return await document.save({ session });
      }
      return await document.save();
    } catch (err) {
      logger.error(
        "Error in MongoService.save",
        err,
        { model: document?.constructor?.modelName || "unknown" }
      );
      throw err;
    }
  }

}

export default MongoService;
