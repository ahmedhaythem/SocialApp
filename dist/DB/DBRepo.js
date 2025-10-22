"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRepo = void 0;
class DBRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    create = async ({ data }) => {
        const doc = await this.model.create(data);
        return doc;
    };
    findOne = async ({ filter, projection, options }) => {
        const doc = await this.model.findOne(filter, projection, options);
        return doc;
    };
    findById = async ({ id, projection, options }) => {
        const doc = await this.model.findById(id, projection, options);
        return doc;
    };
    find = async ({ filter, projection, options }) => {
        const query = this.model.find(filter || {}, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const docs = await query.exec();
        return docs;
    };
}
exports.DBRepo = DBRepo;
