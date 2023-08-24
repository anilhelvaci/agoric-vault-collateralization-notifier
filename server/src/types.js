/**
 * @typedef {Object} User
 * @property {number} id - The user's unique ID, auto-generated by AUTOINCREMENT
 * @property {string} email - The user's email address. Must be unique.
 * @property {string|null} token - The user's verification token.
 * @property {number|null} tokenExpiry - The expiry date of the user's verification token, stored as a unix timestamp (default, 30 min)
 * @property {number} verified - Whether or not the user has verified their email. 0 for not verified, 1 for verified.
 */

/**
 * @typedef {Object} Notifier
 * @property {number} id - The ID of the notifier. auto-generated by AUTOINCREMENT
 * @property {number} userId - The ID of the user that this notifier belongs to. This is a foreign key reference to the `id` field in the `Users` table.
 * @property {number} vaultManagerId - The ID of the vaultManager (collateralType) that this notifier is related to.
 * @property {number} vaultId - The ID of the vault that this notifier is related to.
 * @property {number} collateralizationRatio - The collateralization ratio for this notifier.
 * @property {0|1} active - true when threshold is crossed, false when reset
 * @property {0|1} expired - true when the vault is liquidated or closed
 */

/**
 * @typedef {Object} Brand
 * @property {string} isserName
 * @property {'nat'|'set'|'copy_set'|'copy_bag'} assetKind
 * @property {number} decimalPlaces
 * @property {string} brand
 */

/**
 * @typedef {Object} Quote
 * @property {number} vaultManagerId - The ID of the vaultManager (collateralType) that this notifier is related to.
 * @property {number} quoteAmountIn
 * @property {number} quoteAmountOut
 * @property {string} inIssuerName
 * @property {string} outIssuerName
 * @property {number} latestTimestamp
 */


/**
 * @typedef {Object} Vault
 * @property {number} vaultManagerId - The ID of the vaultManager (collateralType) that this notifier is related to.
 * @property {number} vaultId - The ID of the vault that this notifier is related to.
 * @property {number} locked - Qty of locked collatearl
 * @property {number} debt - Qty of debt owed
 * @property {'active'|'liquidating'|'liquidated'|'closed'} state 
 */

/**
 * @typedef {Object} ProcessEnv
 * @property {number} BCRYPT_SALT_ROUNDS
 * @property {string} BCRYPT_SECRET
 * @property {string} DB_PATH file storage path for .sqlite file. Alternatively, ':memory:' for in-memory database
 * @property {string} JWT_EXPIRY 1h, 1d, 30d, 1y, etc
 * @property {string} JWT_SECRET
 * @property {number} PORT http port for the fastify server
 * @property {string} EMAIL_API_KEY
 * @property {string} EMAIL_FROM sender email
 * @property {string} EMAIL_CALLBACK_URL web url to append access token in email
 * @property {string} EMAIL_DOMAIN sending email domain (mailgun param)
 */

/**
 * @typedef {Object} AgoricChainStoragePathKind
 * @property {string} Children 
 * @property {string} Data
 */