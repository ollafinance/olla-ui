const { keccak256 } = require('ethers');

const sigs = [
  "decimals()",
  "symbol()",
  "name()",
  "depositWithPermit(uint256,address,uint256,uint8,bytes32,bytes32)",
  "nonces(address)"
];

sigs.forEach(sig => {
  console.log(`${sig}: ${keccak256(Buffer.from(sig)).slice(0, 10)}`);
});
