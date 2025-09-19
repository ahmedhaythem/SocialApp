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
}
exports.DBRepo = DBRepo;
