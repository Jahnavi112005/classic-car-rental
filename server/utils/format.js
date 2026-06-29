export function toClient(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
    created_at: obj.createdAt || obj.created_at,
    updated_at: obj.updatedAt || obj.updated_at,
  };
}

export function listToClient(docs) {
  return docs.map(toClient);
}
