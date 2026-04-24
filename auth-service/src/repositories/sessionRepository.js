const Session = require("../models/Session");

const create = async (payload) => Session.create(payload);

const findOneAndDelete = async (filter) => Session.findOneAndDelete(filter);

module.exports = {
  create,
  findOneAndDelete,
};
