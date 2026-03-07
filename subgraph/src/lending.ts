import { BigInt } from "@graphprotocol/graph-ts";
import {
    PositionUpdated as PositionUpdatedEvent,
    LiquidationExecuted as LiquidationExecutedEvent,
} from "../../contracts/out/DeFiLend.sol/DeFiLend";
import {
    Loan,
    LiquidationEvent,
    PositionUpdate,
} from "../generated/schema";

function getOrCreateLoan(userAddress: string): Loan {
    let loan = Loan.load(userAddress);
    if (loan == null) {
        loan = new Loan(userAddress);
        loan.user = new Uint8Array(20);
        loan.collateralAmount = BigInt.zero();
        loan.borrowAmount = BigInt.zero();
        loan.lastUpdated = BigInt.zero();
    }
    return loan;
}

export function handlePositionUpdated(event: PositionUpdatedEvent): void {
    // Update the user's loan state
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.user = event.params.user;
    loan.collateralAmount = BigInt.fromI64(event.params.newCollateral.toI64());
    loan.borrowAmount = BigInt.fromI64(event.params.newBorrow.toI64());
    loan.lastUpdated = event.params.timestamp;
    loan.save();

    // Create position update record
    let update = new PositionUpdate(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    update.user = event.params.user;
    update.asset = event.params.asset;
    update.action = event.params.action;
    update.amount = event.params.amount;
    update.newCollateral = BigInt.fromI64(event.params.newCollateral.toI64());
    update.newBorrow = BigInt.fromI64(event.params.newBorrow.toI64());
    update.timestamp = event.params.timestamp;
    update.blockNumber = event.block.number;
    update.save();
}

export function handleLiquidationExecuted(
    event: LiquidationExecutedEvent
): void {
    // Update the borrower's loan from position
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.borrowAmount = loan.borrowAmount.minus(event.params.debtRepaid);
    loan.collateralAmount = loan.collateralAmount.minus(
        event.params.collateralSeized
    );
    loan.lastUpdated = event.params.timestamp;
    loan.save();

    // Create liquidation event record
    let liquidation = new LiquidationEvent(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    liquidation.liquidator = event.params.liquidator;
    liquidation.user = event.params.user;
    liquidation.collateralAsset = event.params.collateralAsset;
    liquidation.borrowAsset = event.params.borrowAsset;
    liquidation.debtRepaid = event.params.debtRepaid;
    liquidation.collateralSeized = event.params.collateralSeized;
    liquidation.healthFactorBefore = event.params.healthFactorBefore;
    liquidation.timestamp = event.params.timestamp;
    liquidation.blockNumber = event.block.number;
    liquidation.save();
}
