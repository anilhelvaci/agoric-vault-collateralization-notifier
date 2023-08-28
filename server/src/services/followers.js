import {
  getNotifiersByThreshold,
  getAllVaultsByManagerId,
  updateQuote,
  getLatestQuote,
  insertOrReplaceVault,
  updateNotifierStatus,
  setNotifierExpired,
  getNotifiersToReset,
  getNotifiersByVaultId,
  insertOrReplaceBrand,
} from "./db/index.js";
import {
  makeVaultPath,
  quoteFromQuoteState,
  vaultFromVaultState,
} from "../utils/vstoragePaths.js";
import { vstorageWatcher } from "../vstorageWatcher.js";
import { calculateCollateralizationRatio } from "../utils/vaultMath.js";

/**
 * Logic to handle notifications based on collateralization ratio.
 * @param {number} collateralizationRatio - The calculated collateralization ratio.
 * @param {number} managerId - The manager ID for context.
 * @param {number} vaultId - The vault ID for context.
 * @returns {Promise<void>}
 */
export async function maybeSendNotification(
  collateralizationRatio,
  vaultManagerId,
  vaultId
) {
  if (typeof collateralizationRatio !== "number")
    return console.error(`Invalid ratio provided ${collateralizationRatio}`);
  const notifiers = await getNotifiersByThreshold({
    collateralizationRatio,
    vaultManagerId,
    vaultId,
  });

  for (const notifier of notifiers) {
    // @todo call email api
    // mark Notifier as "sent" so we don't send it again
    await updateNotifierStatus(notifier.id, 1);
    console.log(
      `Sending notification to userId: ${notifier.userId} for managerId: ${vaultManagerId} and vaultId: ${vaultId}`
    );
  }

  const activeNotifiers = await getNotifiersToReset({
    collateralizationRatio,
    vaultManagerId,
    vaultId,
  });

  for (const notifier of activeNotifiers) {
    // mark Notifier as "inactive" so we can fire if it crosses the threshold again
    await updateNotifierStatus(notifier.id, 0);
    console.log(
      `Resetting active status for: ${notifier.userId} for managerId: ${vaultManagerId} and vaultId: ${vaultId}`
    );
  }
}

export async function handleVault(path, vaultData) {
  const vault = vaultFromVaultState(path, vaultData);
  const { state: vaultState, vaultManagerId, vaultId, locked, debt } = vault;
  try {
    await insertOrReplaceVault(vault);
  } catch (e) {
    console.warn("error updating vault", e.message);
  }

  if (vaultState === "closed" || vaultState === "liquidated") {
    console.log(`Skipping vault with state: ${vaultState}`);
    await stopWatchingVault(vaultManagerId, vaultId);
    return;
  }

  try {
    const { quoteAmountIn, quoteAmountOut } = await getLatestQuote(
      vaultManagerId
    );
    if (!quoteAmountIn || !quoteAmountOut) throw new Error("Quote not found.");
    const ratio = calculateCollateralizationRatio({
      locked,
      debt,
      quoteAmountIn,
      quoteAmountOut,
    });
    await maybeSendNotification(Number(ratio), vaultManagerId, vaultId);
  } catch (error) {
    console.warn(
      `Unable to fetch the latest quote for managerId: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}

export async function handleQuote(path, value) {
  const { vaultManagerId, quoteAmountIn, quoteAmountOut } = quoteFromQuoteState(
    path,
    value
  );

  try {
    await updateQuote({ vaultManagerId, quoteAmountIn, quoteAmountOut });
    const vaults = await getAllVaultsByManagerId(vaultManagerId);
    if (vaults) console.log(`found ${vaults.length} vaults`);

    for (const { locked, debt, vaultId } of vaults) {
      const ratio = calculateCollateralizationRatio({
        locked,
        debt,
        quoteAmountIn,
        quoteAmountOut,
      });
      await maybeSendNotification(ratio, vaultManagerId, vaultId);
    }
  } catch (error) {
    console.warn(
      `Unable to process quote update for: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}

export async function handleVbankAssets(_path, value) {
  try {
    const promises = value.map(([_denom, { displayInfo, brand, issuerName }]) =>
      insertOrReplaceBrand({
        issuerName,
        brand: String(brand),
        ...displayInfo,
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.warn(
      `Unable to process db upserts for vbank assets. Reason: ${error.message}`
    );
  }
}

/**
 * @param {import('../types').Vault['vaultManagerId']} vaultMangerId
 * @param {import('../types').Vault['vaultId']} vaultId
 * @returns {Promise<void>}
 */
export async function stopWatchingVault(vaultManagerId, vaultId) {
  // stop watching vault path
  vstorageWatcher.removePath(makeVaultPath(vaultManagerId, vaultId));
  // mark relevant notifiers as expired
  const notifiers = await getNotifiersByVaultId({ vaultId, vaultManagerId });
  for (const { id } of notifiers) {
    await setNotifierExpired(id);
  }
}
