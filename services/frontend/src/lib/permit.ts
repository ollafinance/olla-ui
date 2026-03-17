export type Eip712DomainTuple = readonly [
  unknown,
  string,
  string,
  bigint,
  `0x${string}`,
  unknown,
  unknown,
];

export interface ExtractedDomain {
  name: string;
  version: string;
  chainId: bigint;
  verifyingContract: `0x${string}`;
}

export const PERMIT_TYPES = [
  { name: "owner", type: "address" },
  { name: "spender", type: "address" },
  { name: "value", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "deadline", type: "uint256" },
] as const;

export function extractDomainParams(domain: Eip712DomainTuple): ExtractedDomain {
  const [, name, version, chainId, verifyingContract] = domain;
  return {
    name,
    version,
    chainId,
    verifyingContract,
  };
}

export interface PermitMessage {
  owner: `0x${string}`;
  spender: `0x${string}`;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
}

export function buildPermitMessage(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  nonce: bigint,
  deadline: bigint
): PermitMessage {
  return {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };
}
