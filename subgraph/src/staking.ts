import { BigInt } from "@graphprotocol/graph-ts";
import {
    Staked as StakedEvent,
    Withdrawn as WithdrawnEvent,
    RewardPaid as RewardPaidEvent,
} from "../../contracts/out/DeFiStaking.sol/DeFiStaking";
import { StakePosition } from "../generated/schema";

function getOrCreateStakePosition(userAddress: string): StakePosition {
    let position = StakePosition.load(userAddress);
    if (position == null) {
        position = new StakePosition(userAddress);
        position.user = new Uint8Array(20);
        position.stakedAmount = BigInt.zero();
        position.totalRewardsClaimed = BigInt.zero();
        position.lastUpdated = BigInt.zero();
    }
    return position;
}

export function handleStaked(event: StakedEvent): void {
    let position = getOrCreateStakePosition(event.params.user.toHex());
    position.user = event.params.user;
    position.stakedAmount = position.stakedAmount.plus(event.params.amount);
    position.lastUpdated = event.block.timestamp;
    position.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
    let position = getOrCreateStakePosition(event.params.user.toHex());
    position.stakedAmount = position.stakedAmount.minus(event.params.amount);
    position.lastUpdated = event.block.timestamp;
    position.save();
}

export function handleRewardPaid(event: RewardPaidEvent): void {
    let position = getOrCreateStakePosition(event.params.user.toHex());
    position.totalRewardsClaimed = position.totalRewardsClaimed.plus(
        event.params.reward
    );
    position.lastUpdated = event.block.timestamp;
    position.save();
}
