import crypto from "crypto";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 10;

/**
 * @param {number} [bytes] number of bytes to generate, defaults to 32
 * @returns {string} random 32 bit hexadecimal string
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * @param {string} string string to be hashed
 * @returns {string} hashed token
 */
export function hashToken(string) {
  return bcrypt.hashSync(string, SALT_ROUNDS);
}

/**
 * @param {string} plainText plain text token
 * @param {string} hash hashed token
 * @returns {boolean} true if token is valid
 */

export function verifyToken(plainText, hash) {
  return bcrypt.compareSync(plainText, hash);
}