const fs = require("fs");
const path = require("path");

const contracts = [
  "DeFiAMM",
  "DeFiRouter",
  "DeFiLend",
  "DeFiStaking",
  "DeFiFlashLoan",
];

const outDir = path.join(__dirname, "../../contracts/out");
const abiDir = path.join(__dirname, "../src/contracts/abi");

if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

contracts.forEach((contract) => {
  const jsonPath = path.join(outDir, `${contract}.sol`, `${contract}.json`);
  if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    fs.writeFileSync(
      path.join(abiDir, `${contract}.json`),
      JSON.stringify(json.abi, null, 2),
    );
    console.log(`Extracted ABI for ${contract}`);
  } else {
    console.error(`Could not find ${jsonPath}`);
  }
});

// Also extract ERC20 ABI
const erc20Path = path.join(outDir, "IERC20.sol", "IERC20.json");
if (fs.existsSync(erc20Path)) {
  const json = JSON.parse(fs.readFileSync(erc20Path, "utf8"));
  fs.writeFileSync(
    path.join(abiDir, "IERC20.json"),
    JSON.stringify(json.abi, null, 2),
  );
  console.log("Extracted ABI for IERC20");
}
