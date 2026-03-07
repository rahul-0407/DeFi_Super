import { BigInt } from "@graphprotocol/graph-ts";
import {
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent,
    Borrow as BorrowEvent,
    Repay as RepayEvent,
    Liquidate as LiquidateEvent,
} from "../../contracts/out/DeFiLend.sol/DeFiLend";
import { Loan, LiquidationEvent } from "../generated/schema";

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

export function handleDeposit(event: DepositEvent): void {
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.user = event.params.user;
    loan.collateralAmount = loan.collateralAmount.plus(event.params.amount);
    loan.lastUpdated = event.block.timestamp;
    loan.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.collateralAmount = loan.collateralAmount.minus(event.params.amount);
    loan.lastUpdated = event.block.timestamp;
    loan.save();
}

export function handleBorrow(event: BorrowEvent): void {
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.borrowAmount = loan.borrowAmount.plus(event.params.amount);
    loan.lastUpdated = event.block.timestamp;
    loan.save();
}

export function handleRepay(event: RepayEvent): void {
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.borrowAmount = loan.borrowAmount.minus(event.params.amount);
    loan.lastUpdated = event.block.timestamp;
    loan.save();
}

export function handleLiquidate(event: LiquidateEvent): void {
    // Update the borrower's loan
    let loan = getOrCreateLoan(event.params.user.toHex());
    loan.borrowAmount = loan.borrowAmount.minus(event.params.debtRepaid);
    loan.collateralAmount = loan.collateralAmount.minus(
        event.params.collateralSeized
    );
    loan.lastUpdated = event.block.timestamp;
    loan.save();

    // Create liquidation event record
    let liquidation = new LiquidationEvent(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    liquidation.liquidator = event.params.liquidator;
    liquidation.user = event.params.user;
    liquidation.debtRepaid = event.params.debtRepaid;
    liquidation.collateralSeized = event.params.collateralSeized;
    liquidation.timestamp = event.block.timestamp;
    liquidation.blockNumber = event.block.number;
    liquidation.save();
}
