function pick(data, fields) {
  return fields.reduce((acc, field) => {
    if (data[field] !== undefined) {
      acc[field] = data[field];
    }
    return acc;
  }, {});
}

function toUserResponse(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function toUsersResponse(users = []) {
  return users.map(toUserResponse);
}

function toAuthorResponse(user) {
  if (!user) return undefined;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function toPostResponse(post) {
  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    description: post.description,
    status: post.status,
    user_id: post.user_id,
    author: toAuthorResponse(post.user),
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

function toPostsResponse(posts = []) {
  return posts.map(toPostResponse);
}

function toPaginatedResponse({ data, meta }, mapItem) {
  return {
    data: mapItem ? data.map(mapItem) : data,
    meta,
  };
}

module.exports = {
  pick,
  toUserResponse,
  toUsersResponse,
  toAuthorResponse,
  toPostResponse,
  toPostsResponse,
  toPaginatedResponse,
};
