

function pick(data, fields) {
    return fields.reduce((acc, field) => {
      if (data[field] !== undefined) {
        acc[field] = data[field];
      }
      return acc;
    }, {});
  }

  

module.exports = {
  pick,
};