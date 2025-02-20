const users = [];

/**
 * Add a new user to the chat room.
 * @param {Object} param0 - User details { id, username, room }
 * @returns {Object} - User object or error message
 */
export const addUser = ({ id, username, room }) => {
  // Clean & validate input
  username = username?.trim();
  room = room?.trim();

  if (!username || !room) {
    return { error: "Username and room are required!" };
  }

  // Get users in the room
  const usersInRoom = users.filter((user) => user.room === room);

  // Restrict to 2 users per room
  if (usersInRoom.length >= 2) {
    return { error: "Room is full! Only 2 users allowed." };
  }

  // Check for existing user
  const existingUser = usersInRoom.find((user) => user.username === username);
  if (existingUser) {
    return { error: "Username is already taken in this room!" };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

/**
 * Remove a user by ID.
 * @param {string} id - User ID
 * @returns {Object|null} - Removed user object or null if not found
 */
export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  return index !== -1 ? users.splice(index, 1)[0] : null;
};

/**
 * Get user details by ID.
 * @param {string} id - User ID
 * @returns {Object|null} - User object or null if not found
 */
export const getUser = (id) => users.find((user) => user.id === id) || null;

/**
 * Get all users in a specific chat room.
 * @param {string} room - Room name
 * @returns {Array} - List of users in the room
 */
export const getUsersInRoom = (room) => {
  room = room?.trim();
  return users.filter((user) => user.room === room);
};