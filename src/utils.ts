import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { HexString } from "@polkadot/util/types";

/**
 * Convert human readable account address into internal representation
 */
export const accountIdToHex = (accountId: string): HexString => {
  return u8aToHex(decodeAddress(accountId));
};
