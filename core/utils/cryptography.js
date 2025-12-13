import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export default {

  password: {
    hash: async (password) => await bcrypt.hash(password.toString(), 10),

    compare: async (foundPassword, encryptedPassword) =>
      await bcrypt.compare(foundPassword, encryptedPassword),
  },

  trackId() {
    return uuidv4();
  },
};
