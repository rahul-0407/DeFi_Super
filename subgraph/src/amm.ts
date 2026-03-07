import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
    Swap as SwapEvent,
    Mint as MintEvent,
    Burn as BurnEvent,
    Sync as SyncEvent,
} from "../../contracts/out/DeFiAMM.sol/DeFiAMM";
import { Pool, Swap, LiquidityPosition } from "../generated/schema";

function getOrCreatePool(address: string): Pool {
    let pool = Pool.load(address);
    if (pool == null) {
        pool = new Pool(address);
        pool.token0 = new Uint8Array(20);
        pool.token1 = new Uint8Array(20);
        pool.reserve0 = BigInt.zero();
        pool.reserve1 = BigInt.zero();
        pool.totalSupply = BigInt.zero();
        pool.swapCount = BigInt.zero();
        pool.totalVolume0 = BigDecimal.zero();
        pool.totalVolume1 = BigDecimal.zero();
        pool.createdAt = BigInt.zero();
    }
    return pool;
}

export function handleSwap(event: SwapEvent): void {
    let pool = getOrCreatePool(event.address.toHex());
    pool.swapCount = pool.swapCount.plus(BigInt.fromI32(1));
    pool.save();

    let swap = new Swap(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    swap.pool = pool.id;
    swap.sender = event.params.sender;
    swap.to = event.params.to;
    swap.amount0In = event.params.amount0In;
    swap.amount1In = event.params.amount1In;
    swap.amount0Out = event.params.amount0Out;
    swap.amount1Out = event.params.amount1Out;
    swap.timestamp = event.block.timestamp;
    swap.blockNumber = event.block.number;
    swap.save();
}

export function handleMint(event: MintEvent): void {
    let pool = getOrCreatePool(event.address.toHex());
    if (pool.createdAt.equals(BigInt.zero())) {
        pool.createdAt = event.block.timestamp;
    }
    pool.save();

    let posId = event.address.toHex() + "-" + event.params.sender.toHex();
    let position = LiquidityPosition.load(posId);
    if (position == null) {
        position = new LiquidityPosition(posId);
        position.pool = pool.id;
        position.user = event.params.sender;
        position.liquidity = BigInt.zero();
        position.amount0Deposited = BigInt.zero();
        position.amount1Deposited = BigInt.zero();
    }
    position.amount0Deposited = position.amount0Deposited.plus(
        event.params.amount0
    );
    position.amount1Deposited = position.amount1Deposited.plus(
        event.params.amount1
    );
    position.liquidity = position.liquidity.plus(event.params.liquidity);
    position.save();
}

export function handleBurn(event: BurnEvent): void {
    let posId = event.address.toHex() + "-" + event.params.sender.toHex();
    let position = LiquidityPosition.load(posId);
    if (position != null) {
        position.amount0Deposited = position.amount0Deposited.minus(
            event.params.amount0
        );
        position.amount1Deposited = position.amount1Deposited.minus(
            event.params.amount1
        );
        position.save();
    }
}

export function handleSync(event: SyncEvent): void {
    let pool = getOrCreatePool(event.address.toHex());
    pool.reserve0 = event.params.reserve0;
    pool.reserve1 = event.params.reserve1;
    pool.save();
}
