import mongoose from "mongoose";
import logger from "../utils/Logger.js";

class MongoService {
  constructor() {
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
      if (!Model || typeof Model.findOne !== "function") {
        throw new Error("Valid Mongoose Model is required");
      }

      let query = Model.findOne(condition);

      if (session) {
        query = query.session(session);
      }
      if (populate) {
        query = query.populate(populate);
      }

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
        { new: true }
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


}

export default MongoService;
