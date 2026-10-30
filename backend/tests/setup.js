const mongoose = require('mongoose');

// In-Memory Storage for Test Suite
const storage = {
  User: [],
  Complaint: [],
  ComplaintCategory: [],
  ComplaintStatusHistory: [],
  ComplaintAssignment: [],
  ComplaintComment: [],
  ComplaintAttachment: [],
  ComplaintSequence: [],
  AuditLog: [],
};

const toIdStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val._id) return val._id.toString();
  if (val.id) return val.id.toString();
  return val.toString();
};

const matches = (doc, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    return filter.$or.some((subFilter) => matches(doc, subFilter));
  }

  for (const [key, expected] of Object.entries(filter)) {
    if (key === '$or') continue;

    let actual = doc[key];

    if (key === '_id' || key === 'id') {
      if (expected && expected.$ne !== undefined) {
        if (toIdStr(doc._id) === toIdStr(expected.$ne)) return false;
        continue;
      }
      if (toIdStr(doc._id) !== toIdStr(expected)) return false;
      continue;
    }

    if (expected === null) {
      if (actual !== null && actual !== undefined) return false;
      continue;
    }

    if (expected instanceof RegExp) {
      if (!expected.test(String(actual || ''))) return false;
      continue;
    }

    if (expected && typeof expected === 'object') {
      if (expected.$regex) {
        const flags = expected.$options || '';
        const re =
          expected.$regex instanceof RegExp
            ? expected.$regex
            : new RegExp(expected.$regex, flags);
        if (!re.test(String(actual || ''))) return false;
        continue;
      }
      if (expected.$ne !== undefined) {
        if (actual === expected.$ne) return false;
        continue;
      }
      if (expected.$gte !== undefined) {
        const actualDate = new Date(actual).getTime();
        const expectedDate = new Date(expected.$gte).getTime();
        if (actualDate < expectedDate) return false;
        continue;
      }
    }

    if (actual && actual._id) {
      if (toIdStr(actual._id) !== toIdStr(expected)) return false;
      continue;
    }

    if (expected && expected._id) {
      if (toIdStr(actual) !== toIdStr(expected._id)) return false;
      continue;
    }

    if (actual !== expected && String(actual) !== String(expected)) {
      return false;
    }
  }

  return true;
};

const createDocWrapper = (modelName, data) => {
  const doc = { ...(data.toObject ? data.toObject() : data) };
  if (!doc._id) {
    doc._id = new mongoose.Types.ObjectId();
  }
  doc.id = doc._id.toString();
  if (!doc.createdAt) {
    doc.createdAt = new Date();
  }
  doc.updatedAt = new Date();

  doc.save = async function () {
    const arr = storage[modelName];
    const idx = arr.findIndex((d) => d._id.toString() === doc._id.toString());
    doc.updatedAt = new Date();
    if (idx !== -1) {
      arr[idx] = { ...doc };
    } else {
      arr.push({ ...doc });
    }
    return doc;
  };

  return doc;
};

const populateDoc = (doc) => {
  if (!doc) return doc;
  const d = { ...doc };
  if (d.category && !d.category.name) {
    const cat = storage.ComplaintCategory.find(
      (c) => c._id.toString() === toIdStr(d.category)
    );
    if (cat) d.category = { ...cat };
  }
  if (d.citizen && !d.citizen.fullName) {
    const cit = storage.User.find((u) => u._id.toString() === toIdStr(d.citizen));
    if (cit) d.citizen = { ...cit };
  }
  if (d.assignedStaff && !d.assignedStaff.fullName) {
    const stf = storage.User.find(
      (u) => u._id.toString() === toIdStr(d.assignedStaff)
    );
    if (stf) d.assignedStaff = { ...stf };
  }
  if (d.performedBy && !d.performedBy.fullName) {
    const p = storage.User.find(
      (u) => u._id.toString() === toIdStr(d.performedBy)
    );
    if (p) d.performedBy = { ...p };
  }
  if (d.changedBy && !d.changedBy.fullName) {
    const c = storage.User.find(
      (u) => u._id.toString() === toIdStr(d.changedBy)
    );
    if (c) d.changedBy = { ...c };
  }
  if (d.author && !d.author.fullName) {
    const a = storage.User.find((u) => u._id.toString() === toIdStr(d.author));
    if (a) d.author = { ...a };
  }
  if (d.uploadedBy && !d.uploadedBy.fullName) {
    const up = storage.User.find(
      (u) => u._id.toString() === toIdStr(d.uploadedBy)
    );
    if (up) d.uploadedBy = { ...up };
  }
  return d;
};

const setupTestDB = () => {
  beforeAll(() => {
    const models = require('../src/models');

    for (const [name, Model] of Object.entries(models)) {
      if (!Model || !Model.schema) continue;

      // Intercept new Model(...).save()
      Model.prototype.save = async function () {
        const raw = this.toObject ? this.toObject() : this;
        const wrapped = createDocWrapper(name, raw);
        const idx = storage[name].findIndex(
          (d) => d._id.toString() === wrapped._id.toString()
        );
        if (idx !== -1) {
          storage[name][idx] = wrapped;
        } else {
          storage[name].push(wrapped);
        }
        return wrapped;
      };

      Model.create = async function (docs) {
        const isArr = Array.isArray(docs);
        const list = isArr ? docs : [docs];
        const created = [];

        for (const item of list) {
          const wrapped = createDocWrapper(name, item);
          storage[name].push(wrapped);
          created.push(wrapped);
        }

        return isArr ? created : created[0];
      };

      Model.insertMany = async function (docs) {
        return Model.create(docs);
      };

      Model.find = function (filter = {}) {
        let results = storage[name]
          .filter((d) => matches(d, filter))
          .map((d) => createDocWrapper(name, d));

        const query = {
          populate: function () {
            results = results.map(populateDoc);
            return query;
          },
          sort: function (sortObj) {
            if (sortObj) {
              const [k, dir] = Object.entries(sortObj)[0];
              results.sort((a, b) => {
                if (a[k] < b[k]) return dir === 1 ? -1 : 1;
                if (a[k] > b[k]) return dir === 1 ? 1 : -1;
                return 0;
              });
            }
            return query;
          },
          skip: function (num) {
            results = results.slice(num);
            return query;
          },
          limit: function (num) {
            results = results.slice(0, num);
            return query;
          },
          select: function () {
            return query;
          },
          lean: function () {
            return Promise.resolve(results);
          },
          then: function (resolve, reject) {
            return Promise.resolve(results).then(resolve, reject);
          },
        };

        return query;
      };

      Model.findOne = function (filter = {}) {
        let shouldPopulate = false;

        const query = {
          populate: function () {
            shouldPopulate = true;
            return query;
          },
          select: function () {
            return query;
          },
          lean: function () {
            return query;
          },
          then: function (resolve, reject) {
            const raw = storage[name].find((d) => matches(d, filter));
            if (!raw) return Promise.resolve(null).then(resolve, reject);
            const wrapped = createDocWrapper(name, raw);
            const result = shouldPopulate ? populateDoc(wrapped) : wrapped;
            return Promise.resolve(result).then(resolve, reject);
          },
        };

        return query;
      };

      Model.findById = function (id) {
        return Model.findOne({ _id: id });
      };

      Model.findByIdAndDelete = async function (id) {
        const idx = storage[name].findIndex(
          (d) => d._id.toString() === toIdStr(id)
        );
        if (idx !== -1) {
          const removed = storage[name].splice(idx, 1)[0];
          return removed;
        }
        return null;
      };

      Model.countDocuments = async function (filter = {}) {
        return storage[name].filter((d) => matches(d, filter)).length;
      };

      Model.deleteMany = async function (filter = {}) {
        const initial = storage[name].length;
        storage[name] = storage[name].filter((d) => !matches(d, filter));
        return { deletedCount: initial - storage[name].length };
      };

      Model.exists = async function (filter = {}) {
        return storage[name].some((d) => matches(d, filter));
      };

      Model.findOneAndUpdate = async function (filter, update, options = {}) {
        let doc = storage[name].find((d) => matches(d, filter));

        if (!doc) {
          if (options.upsert) {
            doc = createDocWrapper(name, { ...filter });
            storage[name].push(doc);
          } else {
            return null;
          }
        }

        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) {
            doc[k] = (doc[k] || 0) + v;
          }
        }

        if (update.$set) {
          for (const [k, v] of Object.entries(update.$set)) {
            doc[k] = v;
          }
        }

        return createDocWrapper(name, doc);
      };

      Model.aggregate = async function (pipeline) {
        let docs = [...storage[name]];

        for (const stage of pipeline) {
          if (stage.$group) {
            const groupField = stage.$group._id;
            const groups = {};
            for (const d of docs) {
              const rawKey = groupField.replace('$', '');
              const val = d[rawKey];
              const key = val ? val.toString() : 'Unknown';
              groups[key] = (groups[key] || 0) + 1;
            }
            docs = Object.entries(groups).map(([k, count]) => ({
              _id: k,
              count,
            }));
          } else if (stage.$lookup) {
            const fromColl = storage.ComplaintCategory;
            for (const d of docs) {
              d.categoryDoc = fromColl.find((c) => c._id.toString() === d._id);
            }
          } else if (stage.$project) {
            docs = docs.map((d) => ({
              category: d.categoryDoc ? d.categoryDoc.name : 'Unknown',
              area: d.area || d._id,
              count: d.count,
            }));
          }
        }

        return docs;
      };
    }
  });

  afterEach(() => {
    for (const key of Object.keys(storage)) {
      storage[key] = [];
    }
  });
};

module.exports = { setupTestDB };
